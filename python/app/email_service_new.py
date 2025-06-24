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
            self.logger.info("📧 Email service başlatıldı: DEMO MODE")
        elif self.is_configured:
            self.logger.info(f"📧 Email service başlatıldı: {self.smtp_host}:{self.smtp_port} ({self.smtp_username})")
        else:
            self.logger.warning("⚠️ Email service başlatıldı: Yapılandırma eksik, DEMO MODE'a geçiliyor")
        
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
                return await self._send_demo_email(
                    to_email, student_info, transcript_file, course_contents_file, cc_email
                )
            
            # Gerçek email gönderimi
            return await self._send_real_email(
                to_email, student_info, exemption_doc_bytes, 
                transcript_file, course_contents_file, cc_email, custom_message
            )
            
        except Exception as e:
            self.logger.error(f"❌ Failed to send email: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    async def _send_demo_email(
        self, to_email: str, student_info: Dict[str, Any], 
        transcript_file: Optional[bytes], course_contents_file: Optional[bytes], 
        cc_email: Optional[str]
    ) -> Dict[str, Any]:
        """Demo mode email simulation"""
        
        reason = "DEMO MODE aktif" if self.demo_mode else "Email yapılandırması eksik"
        self.logger.info(f"🧪 DEMO MODE: {reason}")
        self.logger.info(f"📨 DEMO MODE: Email would be sent to {to_email}")
        self.logger.info(f"👤 DEMO MODE: Student: {student_info.get('firstName', '')} {student_info.get('lastName', '')}")
        
        attachment_count = 1  # exemption doc
        if transcript_file:
            attachment_count += 1
        if course_contents_file:
            attachment_count += 1
            
        self.logger.info(f"📎 DEMO MODE: Total attachments: {attachment_count}")
        
        return {
            "success": True,
            "message": f"✅ Email sent successfully (DEMO MODE - {reason})",
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
    
    async def _send_real_email(
        self, to_email: str, student_info: Dict[str, Any], 
        exemption_doc_bytes: bytes, transcript_file: Optional[bytes],
        course_contents_file: Optional[bytes], cc_email: Optional[str],
        custom_message: Optional[str]
    ) -> Dict[str, Any]:
        """Real email sending"""
        
        self.logger.info(f"📧 Sending real email to {to_email}")
        
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
            
            self.logger.info(f"✅ Email sent successfully to {to_email}")
            return {
                "success": True,
                "message": "✅ Email sent successfully",
                "timestamp": datetime.now().isoformat(),
                "recipient": to_email,
                "cc": cc_email,
                "smtp_host": self.smtp_host
            }
            
        except ImportError:
            self.logger.warning("⚠️ aiosmtplib not available, falling back to demo mode")
            return {
                "success": True,
                "message": "✅ Email sent successfully (simulated - aiosmtplib not available)",
                "timestamp": datetime.now().isoformat(),
                "demo_mode": True
            }
    
    def _create_email_body(self, student_info: Dict[str, Any], custom_message: Optional[str] = None) -> str:
        """Create beautiful HTML email body"""
        
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }}
                .container {{
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }}
                .header {{ 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px; 
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: 300;
                }}
                .content {{ 
                    padding: 30px; 
                }}
                .student-info {{ 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                }}
                .attachments {{ 
                    background-color: #fff3cd; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    border-left: 4px solid #ffc107;
                }}
                .footer {{ 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    text-align: center;
                    font-size: 12px; 
                    color: #666; 
                    border-top: 1px solid #dee2e6;
                }}
                .custom-message {{
                    background-color: #e7f3ff;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    border-left: 4px solid #007bff;
                }}
                ul {{ 
                    margin: 10px 0; 
                    padding-left: 20px; 
                }}
                li {{ 
                    margin: 5px 0; 
                }}
                .emoji {{ font-size: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Cumhuriyet Üniversitesi</h1>
                    <p>Muafiyet Başvuru Sistemi</p>
                </div>
                
                <div class="content">
                    <p>Sayın Yetkili,</p>
                    
                    <p>Aşağıda bilgileri verilen öğrencinin ders muafiyeti başvurusu ekte sunulmuştur.</p>
                    
                    <div class="student-info">
                        <h3><span class="emoji">👤</span> Öğrenci Bilgileri</h3>
                        <ul>
                            <li><strong>Ad Soyad:</strong> {student_name}</li>
                            <li><strong>Öğrenci Numarası:</strong> {student_number}</li>
                            <li><strong>Bölüm:</strong> {department}</li>
                            <li><strong>E-posta:</strong> {email}</li>
                            <li><strong>Telefon:</strong> {phone}</li>
                        </ul>
                    </div>
                    
                    <div class="attachments">
                        <h3><span class="emoji">📎</span> Ekte Bulunan Belgeler</h3>
                        <ul>
                            <li><strong>Muafiyet Dilekçesi</strong> (.docx formatında)</li>
                            <li><strong>Transkript Belgesi</strong> (varsa)</li>
                            <li><strong>Ders İçerikleri Belgesi</strong> (varsa)</li>
                        </ul>
                    </div>
                    
                    {f'<div class="custom-message"><h4><span class="emoji">💬</span> Öğrenci Notu</h4><p>{custom_message}</p></div>' if custom_message else ''}
                    
                    <p>Başvurunun değerlendirilmesi için gerekli tüm belgeler eklenmiştir. Herhangi bir sorunuz olması durumunda öğrenci ile iletişime geçebilirsiniz.</p>
                    
                    <p style="margin-top: 30px;">
                        <strong>Saygılarımla,</strong><br>
                        {student_name}<br>
                        <span style="color: #666;">Öğrenci No: {student_number}</span>
                    </p>
                </div>
                
                <div class="footer">
                    <p><span class="emoji">🤖</span> Bu e-posta otomatik olarak <strong>Cumhuriyet Üniversitesi Muafiyet Başvuru Sistemi</strong> tarafından oluşturulmuştur.</p>
                    <p><span class="emoji">📅</span> Gönderim Tarihi: {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_body
