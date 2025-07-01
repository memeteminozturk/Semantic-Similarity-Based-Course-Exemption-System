# University Course Exemption System

A comprehensive web application for automating university course exemption applications using AI-powered semantic similarity analysis. This system helps students match their external courses with internal university courses and generates professional exemption documents automatically.

## 🎯 Project Overview

This graduation project (bitirme ödevi) is a full-stack application that streamlines the course exemption process for university students. The system uses advanced Natural Language Processing (NLP) to analyze course content similarities and provides an intuitive wizard-based interface for students to apply for course exemptions.

### Key Features

- **🤖 AI-Powered Course Matching**: Uses Sentence Transformers (all-MiniLM-L6-v2) for semantic similarity analysis
- **📄 PDF Transcript Parsing**: Automatic extraction of course information from PDF transcripts
- **📋 Document Generation**: Automated generation of professional exemption applications in Word format
- **📧 Email Integration**: Direct email sending of exemption documents to university departments
- **🎨 Modern UI**: React-based responsive interface with Ant Design components
- **📊 Interactive Wizard**: Step-by-step guided process for exemption applications
- **🔍 Manual Course Entry**: Option to manually add courses not found in transcripts
- **📈 Real-time Similarity Analysis**: Live matching scores and recommendations

## 🏗️ System Architecture

### Backend (Python - FastAPI)
- **Framework**: FastAPI with async support
- **AI/ML**: Sentence Transformers for semantic similarity
- **Document Processing**: python-docx for Word document generation
- **Email Service**: SMTP integration for automated email sending
- **Data Storage**: JSON-based course repository with optional MongoDB support
- **File Processing**: PDF parsing and file upload handling

### Frontend (React)
- **Framework**: React 19 with React Router
- **UI Library**: Ant Design v5
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form with Zod validation
- **PDF Processing**: PDF.js for client-side PDF parsing
- **Build Tool**: Vite for fast development and building

## 📁 Project Structure

```
├── python/                     # Backend API
│   ├── app/                   # Main application package
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── models.py         # Pydantic data models
│   │   ├── services.py       # Business logic services
│   │   ├── repository.py     # Data access layer
│   │   └── email_service.py  # Email functionality
│   ├── requirements.txt      # Python dependencies
│   ├── internal_courses.json # University course database
│   └── output/              # Generated documents
├── react-front/              # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── wizard/      # Multi-step wizard components
│   │   │   ├── layout/      # Layout components
│   │   │   └── common/      # Shared components
│   │   ├── contexts/        # React contexts
│   │   ├── redux/           # State management
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json         # Node.js dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** for version control

### Backend Setup

1. **Navigate to the Python directory:**
   ```bash
   cd python
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the python directory:
   ```env
   DEFAULT_THRESHOLD=0.80
   MODEL_NAME=all-MiniLM-L6-v2
   MONGO_URI=mongodb://localhost:27017  # Optional
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

5. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to the React directory:**
   ```bash
   cd react-front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser to `http://localhost:5173`

## 🔧 API Endpoints

### Course Matching
- `POST /auto-match` - Semantic similarity analysis for course matching
- `GET /internal-courses` - Retrieve internal university courses

### Document Generation
- `POST /generate-pdf` - Generate exemption application document
- `GET /download/{filename}` - Download generated documents

### Email Services
- `POST /send-email` - Send exemption documents via email

### Health Check
- `GET /health` - API health status

## 🎮 How to Use

### For Students

1. **Start the Wizard**: Access the application and begin the exemption process
2. **Upload Transcript**: Upload your PDF transcript for automatic course extraction
3. **Add Course Contents**: Provide detailed content descriptions for your courses
4. **Review Matches**: Examine AI-generated similarity scores and select exemptions
5. **Enter Personal Info**: Fill in your student and contact information
6. **Generate Document**: Create professional exemption application
7. **Submit Application**: Email the document directly to the university department

### For Developers

1. **Add New Courses**: Update `internal_courses.json` with new university courses
2. **Customize Templates**: Modify Word document templates in the services
3. **Adjust AI Models**: Change similarity thresholds and models in configuration
4. **Extend API**: Add new endpoints in the FastAPI application

## 🧠 AI/ML Components

### Semantic Similarity Engine
- **Model**: all-MiniLM-L6-v2 Sentence Transformer
- **Purpose**: Compares course content descriptions for similarity matching
- **Threshold**: Configurable similarity threshold (default: 80%)
- **Performance**: Optimized for educational content analysis

### Course Content Analysis
- **Text Processing**: Advanced NLP preprocessing for course descriptions
- **Similarity Scoring**: Cosine similarity between course embeddings
- **Ranking System**: Automatic ranking of potential matches

## 📧 Email Integration

The system includes automated email functionality to send exemption documents:

- **SMTP Configuration**: Support for major email providers
- **Attachment Handling**: Automatic attachment of generated documents
- **Template System**: Customizable email templates
- **Error Handling**: Robust error handling for email delivery

## 🛠️ Configuration

### Backend Configuration (`.env`)
```env
# AI Model Settings
DEFAULT_THRESHOLD=0.80          # Similarity threshold (0.0-1.0)
MODEL_NAME=all-MiniLM-L6-v2    # Sentence transformer model

# Database Settings
MONGO_URI=mongodb://localhost:27017  # Optional MongoDB connection

# Email Settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Configuration
The frontend automatically detects the backend API URL and adjusts for development/production environments.

## 🧪 Testing

### Backend Tests
```bash
cd python
pytest test_*.py
```

### Frontend Tests
```bash
cd react-front
npm run test
```

## 📦 Deployment

### Backend Deployment
1. **Production Server**: Use Gunicorn or similar WSGI server
2. **Docker**: Container-ready with environment variables
3. **Cloud**: Compatible with AWS, Google Cloud, Azure

### Frontend Deployment
1. **Build**: `npm run build`
2. **Static Hosting**: Deploy to Netlify, Vercel, or similar
3. **CDN**: Optimized for content delivery networks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is a graduation thesis (bitirme ödevi) and is intended for educational purposes.

## 👨‍💻 Author

**Memet Emin Öztürk**
- Student Number: 2021123087
- University: Sivas Cumhuriyet Üniversitesi
- Department: Bilgisayar Mühendisliği
- Email: 2021123087@cumhuriyet.edu.tr

## 🙏 Acknowledgments

- **Sivas Cumhuriyet University** - Computer Engineering Department
- **Sentence Transformers** - For providing excellent NLP models
- **FastAPI Community** - For the amazing web framework
- **React Team** - For the powerful frontend library
- **Ant Design** - For the beautiful UI components

## 📞 Support

For questions or support regarding this project:
- Email: 2021123087@cumhuriyet.edu.tr
- Create an issue in this repository
- Contact the Computer Engineering Department

---

**Note**: This is a graduation project (bitirme ödevi) developed as part of the Computer Engineering program at Sivas Cumhuriyet University. The system is designed to demonstrate modern web development practices, AI integration, and practical problem-solving in educational technology.