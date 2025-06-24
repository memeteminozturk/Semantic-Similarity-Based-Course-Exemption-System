from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from .models     import (AutoMatchRequest, AutoMatchResponse, AutoMatchResult, MatchCandidate,
                        PdfGenerationRequest, PdfGenerationResponse, EmailRequest, EmailResponse)
from .repository import CourseRepository
from .services   import SimilarityService, PdfGenerationService
from .email_service_new import EmailService
import logging, time, os
import numpy as np
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# ——— Ayarlar ——— #
DEFAULT_THRESHOLD = float(os.getenv("DEFAULT_THRESHOLD", 0.80))
MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
MONGO_URI  = os.getenv("MONGO_URI")  # Yoksa JSON kullanılır

# File size limits (25MB = 25 * 1024 * 1024 bytes)
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB

def validate_file_size(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> None:
    """Validate file size and raise HTTPException if too large"""
    if hasattr(file, 'size') and file.size and file.size > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"Dosya boyutu çok büyük. Maksimum: {max_size / (1024*1024):.1f}MB, "
                   f"Yüklenen: {file.size / (1024*1024):.1f}MB"
        )
    
    # If size is not available, read and check content length
    if not hasattr(file, 'size') or not file.size:
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Dosya boyutu çok büyük. Maksimum: {max_size / (1024*1024):.1f}MB, "
                       f"Yüklenen: {file_size / (1024*1024):.1f}MB"
            )

app = FastAPI(title="Semantic Similarity API – Auto Match v1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
logger = logging.getLogger("auto_api")

repo = CourseRepository(mongo_uri=MONGO_URI)
sim_svc = None
email_svc = EmailService()

@app.on_event("startup")
async def bootstrap():
    await repo.load()
    logger.info("Internal course cache loaded: %d ders", len(repo._cache))
    global sim_svc
    sim_svc = SimilarityService(MODEL_NAME, DEFAULT_THRESHOLD, repo)

# ——— ENDPOINT ——— #
@app.post("/auto-match", response_model=AutoMatchResponse)
async def auto_match(req: AutoMatchRequest):
    start = time.perf_counter()

    # 1) Harici dersler için konular hazırlanır
    ext_codes, ext_contents = [], []
    for item in req.items:
        ext_codes.append(item.ext_code)
        ext_contents.append(item.ext_content)
    
    # 2) Harici derslerin tüm dahili derslerle otomatik eşleştirilmesi
    similarity_matrix = sim_svc.auto_match(ext_contents)
    
    # 3) Yanıt objeleri oluşturulur
    results = []
    threshold_pct = round(sim_svc.threshold * 100, 2)
    
    for i, ext_code in enumerate(ext_codes):
        # Bu harici ders için tüm dahili derslerle benzerlik
        course_sims = similarity_matrix[i]
        
        # En yüksek benzerlikli olanlarını bul
        candidates = []
        for j, sim in enumerate(course_sims):
            int_code = sim_svc._int_codes[j]
            percent = round(float(sim) * 100, 2)
            exempt = percent >= threshold_pct
            
            # Sonuç objesini oluştur
            candidates.append(MatchCandidate(
                int_code=int_code,
                percent=percent,
                exempt=exempt
            ))
        
        # Benzerliklere göre sırala (yüksekten düşüğe)
        candidates.sort(key=lambda x: x.percent, reverse=True)
        
        # Bu harici ders için nihai sonuç
        result = AutoMatchResult(
            ext_code=ext_code,
            candidates=candidates
        )
        results.append(result)
    
    logger.info("auto-match size=%d finished in %.1f ms", len(results),
                (time.perf_counter()-start)*1000)
    return AutoMatchResponse(results=results)

@app.post("/generate-pdf")
async def generate_pdf(req: PdfGenerationRequest):
    """Generate Word document for course exemption application (maintains PDF endpoint for compatibility)"""
    start = time.perf_counter()
    
    try:
        # Validate input data
        if not req.personalInfo or not req.selectedCourses:
            raise HTTPException(status_code=400, detail="Personal info and selected courses are required")
        
        if len(req.selectedCourses) == 0:
            raise HTTPException(status_code=400, detail="At least one course must be selected")
        
        # Check for required fields
        for i, course in enumerate(req.selectedCourses):
            if not course.ext_name:
                raise HTTPException(status_code=400, detail=f"Course at index {i} is missing ext_name field")
            if not course.int_name:
                raise HTTPException(status_code=400, detail=f"Course at index {i} is missing int_name field")
        
        # Convert Pydantic models to dictionaries for Word generation
        personal_info_dict = req.personalInfo.dict()
        selected_courses_list = [course.dict() for course in req.selectedCourses]
        
        # Debug info
        for i, course in enumerate(selected_courses_list):
            logger.info(f"Course {i}: ext_name={course.get('ext_name')}, int_name={course.get('int_name')}")
        
        # Generate Word document (using the PdfGenerationService for backward compatibility)
        word_bytes = PdfGenerationService.generate_exemption_pdf(
            personal_info=personal_info_dict,
            muafiyet_courses=selected_courses_list,
            timestamp=req.timestamp
        )
        
        # Log generation statistics
        doc_size = len(word_bytes)
        generation_time = (time.perf_counter() - start) * 1000
        
        logger.info("Word document generated: %d courses, %d bytes, %.1f ms", 
                   len(req.selectedCourses), doc_size, generation_time)
        
        # Return Word document as binary response
        return Response(
            content=word_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": "attachment; filename=muafiyet_basvurusu.docx",
                "Content-Length": str(doc_size)
            }
        )
        
    except Exception as e:
        logger.error("Word document generation failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

@app.post("/send-email", response_model=EmailResponse)
async def send_email(
    to_email: str = Form(...),
    cc_email: str = Form(None),
    subject: str = Form(...),
    message: str = Form(None),
    student_info: str = Form(...),  # JSON string of PersonalInfo
    exemption_document: UploadFile = File(...),
    transcript_file: UploadFile = File(None),
    course_contents_file: UploadFile = File(None)
):
    """Send exemption email with attachments"""
    start = time.perf_counter()
    
    try:
        # Parse student info from JSON string
        import json
        try:
            student_info_dict = json.loads(student_info)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid student_info JSON format")
          # Validate required fields
        if not to_email or '@' not in to_email:
            raise HTTPException(status_code=400, detail="Valid to_email is required")
        
        if not exemption_document:
            raise HTTPException(status_code=400, detail="Exemption document is required")
        
        # Validate file sizes BEFORE reading
        validate_file_size(exemption_document)
        if transcript_file:
            validate_file_size(transcript_file)
        if course_contents_file:
            validate_file_size(course_contents_file)
        
        # Read file contents
        exemption_doc_bytes = await exemption_document.read()
        transcript_bytes = await transcript_file.read() if transcript_file else None
        course_contents_bytes = await course_contents_file.read() if course_contents_file else None
        
        # Send email
        result = await email_svc.send_exemption_email(
            to_email=to_email,
            student_info=student_info_dict,
            exemption_doc_bytes=exemption_doc_bytes,
            transcript_file=transcript_bytes,
            course_contents_file=course_contents_bytes,
            cc_email=cc_email,
            custom_message=message
        )
        
        # Log sending statistics
        email_time = (time.perf_counter() - start) * 1000
        logger.info("Email sent: to=%s, attachments=%d, %.1f ms", 
                   to_email, 
                   sum(1 for f in [exemption_doc_bytes, transcript_bytes, course_contents_bytes] if f),
                   email_time)
        
        return EmailResponse(
            success=result["success"],
            message=result["message"],
            timestamp=result["timestamp"]
        )
        
    except Exception as e:
        logger.error("Email sending failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

# Legacy endpoint for backward compatibility
@app.post("/sendMail")
async def send_mail_legacy(
    to: str = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...),
    timestamp: str = Form(None),
    fileSize: str = Form(None)
):
    """Legacy email endpoint for backward compatibility"""
    try:
        # Create basic student info from form data
        student_info_dict = {
            "firstName": "Öğrenci",
            "lastName": "",
            "studentNumber": "Unknown",
            "department": "Bilgisayar Mühendisliği",
            "email": to,
            "phone": ""
        }
        
        # Read file content
        file_bytes = await file.read()
        
        # Send email using new service
        result = await email_svc.send_exemption_email(
            to_email=to,
            student_info=student_info_dict,
            exemption_doc_bytes=file_bytes,
            custom_message="Bu e-posta eski API kullanılarak gönderilmiştir."
        )
        
        return {
            "message": result["message"],
            "success": result["success"],
            "timestamp": result["timestamp"]
        }
        
    except Exception as e:
        logger.error("Legacy email sending failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")


