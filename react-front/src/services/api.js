// src/services/api.js
import { message } from 'antd';

const API_URL = 'http://localhost:8000'; // Update with your actual API URL

export async function matchCourses(transcript, oldContents) {
    try {
        // Validate inputs
        if (!transcript || !oldContents) {
            throw new Error('Transcript ve ders içerikleri dosyaları gereklidir');
        }

        const formData = new FormData();
        formData.append('transcript', transcript);
        formData.append('old_contents', oldContents);

        // Add additional metadata to help the Python service
        if (transcript.name) formData.append('transcript_name', transcript.name);
        if (oldContents.name) formData.append('old_contents_name', oldContents.name);

        console.log('Sending files to similarity service:', {
            transcript: transcript.name,
            oldContents: oldContents.name
        });

        // Set timeout to 30 seconds for potentially large files
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_URL}/match`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }

        const result = await response.json();
        console.log('Received match results:', result);
        return result;
    } catch (error) {
        // Don't show error message here, let calling component handle it
        console.error('Benzerlik eşleştirmesi API hatası:', error);
        throw error;
    }
}

export async function generatePdf(personalInfo, selectedCourses) {
    // Note: Despite the function name, this now generates a Word document (.docx) 
    // The backend API endpoint remains /generate-pdf for backward compatibility
    try {
        // Validate inputs
        if (!personalInfo || !selectedCourses || selectedCourses.length === 0) {
            throw new Error('Kişisel bilgiler ve en az bir seçilmiş ders gereklidir');
        }

        console.log('Generating Word document with:', {
            personalInfo,
            selectedCoursesCount: selectedCourses.length
        });

        // Set timeout to 20 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(`${API_URL}/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalInfo,
                selectedCourses,
                timestamp: new Date().toISOString(),
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Word document generation failed - ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        console.log('Word document generated successfully, size:', blob.size, 'bytes');
        return blob;
    } catch (error) {
        // Don't show error message here, let calling component handle it
        console.error('Word document generation API error:', error);
        throw error;
    }
}

export async function sendEmail(to, subject, pdfBlob, studentInfo = null, transcriptFile = null, courseContentsFile = null, ccEmail = null, customMessage = null) {
    try {
        // Validate inputs
        if (!to || !to.includes('@') || !subject || !pdfBlob) {
            throw new Error('Geçerli bir e-posta adresi, konu ve dosya gereklidir');
        }

        console.log('Sending comprehensive email to:', to, 'with attachments:', {
            exemption: !!pdfBlob,
            transcript: !!transcriptFile,
            courseContents: !!courseContentsFile
        });

        const formData = new FormData();
        formData.append('to_email', to);
        formData.append('subject', subject);
        
        // Add student info as JSON string
        if (studentInfo) {
            formData.append('student_info', JSON.stringify(studentInfo));
        } else {
            // Fallback student info
            formData.append('student_info', JSON.stringify({
                firstName: 'Öğrenci',
                lastName: '',
                studentNumber: 'Unknown',
                department: 'Bilgisayar Mühendisliği',
                email: to,
                phone: ''
            }));
        }
        
        // Add exemption document
        formData.append('exemption_document', pdfBlob, 'muafiyet_basvurusu.docx');
        
        // Add optional files
        if (transcriptFile) {
            formData.append('transcript_file', transcriptFile, 'transkript.pdf');
        }
        
        if (courseContentsFile) {
            formData.append('course_contents_file', courseContentsFile, 'ders_icerikleri.pdf');
        }
        
        // Add optional fields
        if (ccEmail) {
            formData.append('cc_email', ccEmail);
        }
        
        if (customMessage) {
            formData.append('message', customMessage);
        }

        // Set timeout to 30 seconds for multiple attachments
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_URL}/send-email`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Email sending failed - ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        // Don't show error message here, let calling component handle it
        console.error('Email API error:', error);
        throw error;
    }
}

// Legacy function for backward compatibility
export async function sendEmailLegacy(to, subject, pdfBlob) {
    try {
        // Validate inputs
        if (!to || !to.includes('@') || !subject || !pdfBlob) {
            throw new Error('Geçerli bir e-posta adresi, konu ve dosya gereklidir');
        }

        console.log('Sending legacy email to:', to, 'with subject:', subject);

        const formData = new FormData();
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('file', pdfBlob, 'muafiyet_basvurusu.docx');

        // Add additional metadata
        formData.append('timestamp', new Date().toISOString());
        formData.append('fileSize', pdfBlob.size);

        // Set timeout to 15 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_URL}/sendMail`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Email sending failed - ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Legacy email sent successfully:', result);
        return result;
    } catch (error) {
        // Don't show error message here, let calling component handle it
        console.error('Legacy email API error:', error);
        throw error;
    }
}

export async function bulkMatch(items) {
    // Items should already be prepared as { ext_code, ext_content, int_code }
    try {
        const response = await fetch(`${API_URL}/similarity/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Bulk similarity failed - ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Bulk similarity API error:', error);
        throw error;
    }
}

export async function autoMatch(courses) {
    // Convert courses to the expected format for auto-match API
    // courses should have { code, content } structure
    try {
        const items = courses.map(course => ({
            ext_code: course.code,
            ext_content: course.content || ''
        }));

        console.log('Sending auto-match request:', { items });

        const response = await fetch(`${API_URL}/auto-match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Auto-match failed - ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Auto-match response:', result);
        return result;
    } catch (error) {
        console.error('Auto-match API error:', error);
        throw error;
    }
}
