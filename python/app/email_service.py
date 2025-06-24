# app/email_service.py
import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

class EmailService:
    """Email service for sending exemption documents and attachments"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.demo_mode = os.getenv("EMAIL_DEMO_MODE", "true").lower() == "true"
        self.logger = logging.getLogger(__name__)
        
        # Email yapılandırma durumunu kontrol et
        self.is_configured = bool(self.smtp_username and self.smtp_password)
        
        if self.demo_mode:
            self.logger.info("Email service başlatıldı: DEMO MODE")
        elif self.is_configured:
            self.logger.info(f"Email service başlatıldı: {self.smtp_host}:{self.smtp_port} ({self.smtp_username})")
        else:
            self.logger.warning("Email service başlatıldı: Yapılandırma eksik, DEMO MODE'a geçiliyor")
        
    async def send_exemption_email(
        self,
        to_email: str,
        student_info: Dict[str, Any],
        exemption_doc_bytes: bytes,
        transcript_file: Optional[bytes] = None,
        course_contents_file: Optional[bytes] = None,
        cc_email: Optional[str] = None,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send exemption email with attachments"""
          try:
            # Demo mode veya yapılandırma kontrolü
            if self.demo_mode or not self.is_configured:
                reason = "DEMO MODE aktif" if self.demo_mode else "Email yapılandırması eksik"
                self.logger.info(f"DEMO MODE: {reason}")
                self.logger.info(f"DEMO MODE: Email would be sent to {to_email}")
                self.logger.info(f"DEMO MODE: Student: {student_info.get('firstName', '')} {student_info.get('lastName', '')}")
                
                attachment_count = 1  # exemption doc
                if transcript_file:
                    attachment_count += 1
                if course_contents_file:
                    attachment_count += 1
                    
                self.logger.info(f"DEMO MODE: Total attachments: {attachment_count}")
                
                # Demo response
                return {
                    "success": True,
                    "message": f"Email sent successfully (DEMO MODE - {reason})",
                    "message_id": f"<demo_{int(datetime.now().timestamp())}@demo.local>",
                    "timestamp": datetime.now().isoformat(),
                    "demo_mode": True,
                    "reason": reason,
                    "recipient": to_email,
                    "cc": cc_email,
                    "attachments": attachment_count,
                    "smtp_config": {
                        "host": self.smtp_host,
                        "port": self.smtp_port,
                        "username_configured": bool(self.smtp_username),
                        "password_configured": bool(self.smtp_password)
                    }
                }
            
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            if cc_email:
                msg['Cc'] = cc_email
            msg['Subject'] = f"Muafiyet Başvurusu - {student_info.get('firstName', '')} {student_info.get('lastName', '')} ({student_info.get('studentNumber', '')})"
            
            # Create email body
            body = self._create_email_body(student_info, custom_message)
            msg.attach(MIMEText(body, 'html', 'utf-8'))
            
            # Attach exemption document
            if exemption_doc_bytes:
                doc_attachment = MIMEApplication(exemption_doc_bytes)
                doc_attachment.add_header(
                    'Content-Disposition', 
                    'attachment', 
                    filename=f"muafiyet_dilekcesi_{student_info.get('studentNumber', 'ogrenci')}.docx"
                )
                msg.attach(doc_attachment)
            
            # Attach transcript if provided
            if transcript_file:
                transcript_attachment = MIMEApplication(transcript_file)
                transcript_attachment.add_header(
                    'Content-Disposition', 
                    'attachment', 
                    filename=f"transkript_{student_info.get('studentNumber', 'ogrenci')}.pdf"
                )
                msg.attach(transcript_attachment)
            
            # Attach course contents if provided
            if course_contents_file:
                contents_attachment = MIMEApplication(course_contents_file)
                contents_attachment.add_header(
                    'Content-Disposition', 
                    'attachment', 
                    filename=f"ders_icerikleri_{student_info.get('studentNumber', 'ogrenci')}.pdf"
                )
                msg.attach(contents_attachment)
            
            # Send email using aiosmtplib
            recipients = [to_email]
            if cc_email:
                recipients.append(cc_email)
                
            try:
                import aiosmtplib
                await aiosmtplib.send(
                    msg,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    start_tls=True,
                    username=self.smtp_username,
                    password=self.smtp_password,
                    recipients=recipients
                )
                
                self.logger.info(f"Email sent successfully to {to_email}")
                return {
                    "success": True,
                    "message": "Email sent successfully",
                    "timestamp": datetime.now().isoformat(),
                    "recipient": to_email,
                    "cc": cc_email
                }
                
            except ImportError:
                # Fallback: simulate email sending for development
                self.logger.warning("aiosmtplib not available, falling back to demo mode")
                return {
                    "success": True,
                    "message": "Email sent successfully (simulated - aiosmtplib not available)",
                    "timestamp": datetime.now().isoformat(),
                    "demo_mode": True
                }
            
        except Exception as e:
            self.logger.error(f"Failed to send email: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _create_email_body(self, student_info: Dict[str, Any], custom_message: Optional[str] = None) -> str:
        """Create HTML email body"""
        
        student_name = f"{student_info.get('firstName', '')} {student_info.get('lastName', '')}"
        student_number = student_info.get('studentNumber', '')
        department = student_info.get('department', 'Bilgisayar Mühendisliği')
        email = student_info.get('email', '')
        phone = student_info.get('phone', '')
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }}
                .content {{ padding: 20px; }}
                .footer {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666; }}
                .student-info {{ background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .attachments {{ background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Cumhuriyet Üniversitesi - Muafiyet Başvurusu</h2>
            </div>
            
            <div class="content">
                <p>Sayın Yetkili,</p>
                
                <p>Aşağıda bilgileri verilen öğrencinin muafiyet başvurusu ekte sunulmuştur.</p>
                
                <div class="student-info">
                    <h3>Öğrenci Bilgileri:</h3>
                    <ul>
                        <li><strong>Ad Soyad:</strong> {student_name}</li>
                        <li><strong>Öğrenci Numarası:</strong> {student_number}</li>
                        <li><strong>Bölüm:</strong> {department}</li>
                        <li><strong>E-posta:</strong> {email}</li>
                        <li><strong>Telefon:</strong> {phone}</li>
                    </ul>
                </div>
                
                <div class="attachments">
                    <h3>Ekte Bulunan Belgeler:</h3>
                    <ul>
                        <li>Muafiyet Dilekçesi (Word formatında)</li>
                        <li>Transkript Belgesi (varsa)</li>
                        <li>Ders İçerikleri Belgesi (varsa)</li>
                    </ul>
                </div>
                
                {f'<p><strong>Öğrenci Notu:</strong> {custom_message}</p>' if custom_message else ''}
                
                <p>Başvurunun değerlendirilmesi için gerekli tüm belgeler eklenmiştir.</p>
                
                <p>Saygılarımla,<br>
                {student_name}<br>
                Öğrenci No: {student_number}</p>
            </div>
            
            <div class="footer">
                <p>Bu e-posta otomatik olarak Cumhuriyet Üniversitesi Muafiyet Başvuru Sistemi tarafından oluşturulmuştur.</p>
                <p>Gönderim Tarihi: {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
            </div>
        </body>
        </html>
        """
        
        return html_body
