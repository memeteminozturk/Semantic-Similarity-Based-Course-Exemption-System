# app/models.py
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# ───────── İstek Tarafı (external ders) ───────── #
class ExtCourse(BaseModel):
    ext_code: str = Field(..., example="CSE101")
    ext_content: str = Field(..., example="Programming basics…")

# ───────── Yanıt Tarafı (eşleşme sonucu) ───────── #
class MatchCandidate(BaseModel):
    int_code: str
    percent: float
    exempt: bool

class AutoMatchResult(BaseModel):
    ext_code: str
    candidates: List[MatchCandidate]  # boş liste ⇒ muaf ders yok

class AutoMatchRequest(BaseModel):
    items: List[ExtCourse]

class AutoMatchResponse(BaseModel):
    """Auto match birden fazla ders için sonuçları içeren yanıt"""
    results: List[AutoMatchResult]

# ───────── PDF Generation Models ───────── #
class PersonalInfo(BaseModel):
    firstName: str = Field(..., example="Memet Emin")
    lastName: str = Field(..., example="Öztürk")
    studentNumber: str = Field(..., example="2021123087")
    university: str = Field(..., example="Sivas Cumhuriyet Üniversitesi")
    faculty: str = Field(..., example="Mühendislik Fakültesi")
    department: str = Field(..., example="Bilgisayar Mühendisliği")
    email: str = Field(..., example="2021123087@cumhuriyet.edu.tr")
    phone: Optional[str] = Field(None, example="+90 555 123 4567")

class SelectedCourse(BaseModel):
    ext_code: str = Field(..., example="CSE101")
    ext_name: str = Field(..., example="Introduction to Computer Science")
    ext_credit: str = Field(..., example="3-0-3")
    ext_content: str = Field(..., example="Programming fundamentals...")
    int_code: str = Field(..., example="BIL101")
    int_name: str = Field(..., example="Bilgisayar Bilimlerine Giriş")
    int_credit: str = Field(..., example="3-0-3")
    int_content: Optional[str] = Field(None, example="Fundamentals of Programming...")
    similarity_percent: float = Field(..., example=85.5)
    exempt: bool = Field(..., example=True)

class PdfGenerationRequest(BaseModel):
    personalInfo: PersonalInfo
    selectedCourses: List[SelectedCourse]
    timestamp: Optional[str] = Field(None, example="2024-12-12T10:30:00Z")

class PdfGenerationResponse(BaseModel):
    message: str = Field(..., example="PDF generated successfully")
    filename: str = Field(..., example="muafiyet_basvurusu.pdf")
    size_bytes: int = Field(..., example=125000)

# ───────── Email Models ───────── #
class EmailRequest(BaseModel):
    to_email: str = Field(..., example="2021123087@cumhuriyet.edu.tr")
    cc_email: Optional[str] = Field(None, example="2021123087@cumhuriyet.edu.tr")
    subject: str = Field(..., example="Muafiyet Başvurusu")
    message: Optional[str] = Field(None, example="Muafiyet başvuru dilekçem ekte bulunmaktadır.")
    student_info: PersonalInfo
    attachment_types: List[str] = Field(default=["exemption_document"], example=["exemption_document", "transcript", "course_contents"])

class EmailResponse(BaseModel):
    success: bool = Field(..., example=True)
    message: str = Field(..., example="Email sent successfully")
    message_id: Optional[str] = Field(None, example="<msg_id@server.com>")
    timestamp: str = Field(..., example="2024-12-12T10:30:00Z")
