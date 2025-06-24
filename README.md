# Semantic Similarity Based Course Exemption System

A comprehensive web application that automates the course exemption process for universities using semantic similarity analysis. The system allows students to upload their transcripts and automatically matches their completed courses with internal university courses based on content similarity.

## 🚀 Features

- **PDF Transcript Processing**: Upload and extract course information from PDF transcripts
- **Semantic Similarity Matching**: Uses state-of-the-art NLP models to match courses based on content similarity
- **Interactive Web Interface**: Modern React-based frontend with step-by-step wizard
- **Automated Document Generation**: Generates official exemption petition documents in Word format
- **Email Integration**: Automated email delivery of generated documents
- **Manual Course Entry**: Option to manually add courses if needed
- **Real-time Progress Tracking**: Visual feedback throughout the process

## 🏗️ Architecture

### Backend (Python/Flask)
- **Flask API**: RESTful API for course matching and document generation
- **Sentence Transformers**: `all-MiniLM-L6-v2` model for semantic similarity
- **PDF Processing**: Extract course information from transcript PDFs
- **Word Document Generation**: Create official petition documents
- **Email Service**: SMTP integration for document delivery

### Frontend (React/Vite)
- **Modern React**: Built with Vite for fast development
- **Material-UI Components**: Professional UI components
- **State Management**: Redux for application state
- **File Upload**: Drag-and-drop PDF upload functionality
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🔧 Installation

### Backend Setup

1. Navigate to the Python directory:
```bash
cd python
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment configuration:
```bash
cp .env.example .env
```

5. Edit `.env` file with your configuration:
```env
MODEL_NAME=all-MiniLM-L6-v2
DEFAULT_THRESHOLD=0.80

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

FROM_EMAIL=your_email@gmail.com

# Development Settings
DEBUG=true
EMAIL_DEMO_MODE=false
```

### Frontend Setup

1. Navigate to the React directory:
```bash
cd react-front
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd python
python app/main.py
```
The API will be available at `http://localhost:5000`

### Start Frontend Development Server
```bash
cd react-front
npm run dev
# or
yarn dev
```
The web application will be available at `http://localhost:5173`

## 📝 API Endpoints

### Course Matching
- `POST /api/match-courses` - Match external courses with internal courses
- `POST /api/upload-transcript` - Upload and process PDF transcript
- `GET /api/internal-courses` - Get list of internal university courses

### Document Generation
- `POST /api/generate-exemption-document` - Generate exemption petition document
- `POST /api/send-document-email` - Send generated document via email

## 🎯 Usage

1. **Upload Transcript**: Start by uploading your PDF transcript
2. **Review Extracted Courses**: Check automatically extracted course information
3. **Course Matching**: System automatically matches courses using semantic similarity
4. **Manual Adjustments**: Add or modify courses as needed
5. **Generate Document**: Create official exemption petition document
6. **Email Delivery**: Receive the document via email

## 🔬 Semantic Similarity Model

The system uses the `all-MiniLM-L6-v2` sentence transformer model which:
- Converts course descriptions into 384-dimensional embeddings
- Calculates cosine similarity between course contents
- Provides configurable similarity threshold (default: 0.80)
- Handles Turkish language course descriptions effectively

## 📊 Course Matching Algorithm

1. **Text Preprocessing**: Clean and normalize course descriptions
2. **Embedding Generation**: Convert descriptions to numerical vectors
3. **Similarity Calculation**: Compute cosine similarity scores
4. **Threshold Filtering**: Filter matches above configured threshold
5. **Ranking**: Sort matches by similarity score

## 🛠️ Configuration

### Email Setup
For Gmail SMTP, you need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in the configuration

See `GMAIL_SETUP.md` for detailed instructions.

### Model Configuration
- `MODEL_NAME`: Sentence transformer model name
- `DEFAULT_THRESHOLD`: Minimum similarity score for matches
- `DEBUG`: Enable debug mode for development

## 📁 Project Structure

```
├── python/                 # Backend application
│   ├── app/               # Flask application
│   │   ├── main.py       # Main Flask app
│   │   ├── models.py     # Data models
│   │   ├── services.py   # Business logic
│   │   └── repository.py # Data access layer
│   ├── templates/         # HTML templates
│   ├── requirements.txt   # Python dependencies
│   └── .env.example      # Environment template
├── react-front/          # Frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── redux/        # State management
│   │   └── services/     # API services
│   ├── package.json      # Node.js dependencies
│   └── .env.example      # Environment template
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup, please open an issue or contact the development team.

## 🔮 Future Enhancements

- [ ] Support for multiple languages
- [ ] Advanced PDF parsing for complex layouts
- [ ] Integration with university information systems
- [ ] Batch processing for multiple transcripts
- [ ] Machine learning model fine-tuning
- [ ] Mobile application
- [ ] API rate limiting and authentication
- [ ] Advanced analytics and reporting
