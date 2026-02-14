# 🌟 TARANG: AI-Powered Autism Care Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org)
[![AWS](https://img.shields.io/badge/AWS-Bedrock%20%7C%20Polly%20%7C%20S3-orange?logo=amazon-aws)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Enterprise-grade AI platform for early autism screening, diagnosis support, and comprehensive care management**
> 
> **Built for AWS "AI for Bharat" Hackathon - Track 5: AI for Healthcare & Life Sciences**

TARANG combines cutting-edge AI, computer vision, and healthcare interoperability standards to provide a complete autism care continuum—from early screening to long-term progress tracking. Powered by Amazon Bedrock, Amazon Polly, and AWS infrastructure for India-first accessibility.

---

## 🏆 **AWS "AI for Bharat" Hackathon**

**Track 5: AI for Healthcare & Life Sciences**

TARANG addresses India's autism diagnosis gap by leveraging AWS Native services:

- **Amazon Bedrock (Claude 3.5 Sonnet):** Generates evidence-based clinical summaries with confidence scores and fallback logic
- **Amazon Polly (Neural TTS):** Provides vernacular accessibility in 8+ Indian languages (Hindi, Hinglish, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati)
- **Amazon S3 (SSE-KMS):** Securely stores screening videos and PDF reports with encryption
- **Region: ap-south-1 (Mumbai):** Ensures data sovereignty and low-latency access for Indian users
- **India-First Design:** Optimized for ₹8,000 smartphones and 2G connectivity in Tier-2/3 cities

**Key Differentiators:**
- Not using GPT — powered by Amazon Bedrock's Claude 3.5 Sonnet
- True vernacular support via Amazon Polly, not just translated UI strings
- FHIR R4 compliance for hospital interoperability (AWS HealthLake ready)
- Zero-cost screening for parents, accessible from home

---

## 🎯 **Key Features**

### 🧠 **Multi-Agent AI System (AWS Bedrock Powered)**
- **Screening Agent:** ML-powered risk assessment using video analysis and questionnaires
- **Clinical Agent:** Professional report generation with Amazon Bedrock (Claude 3.5 Sonnet) for evidence-based summaries
- **Outcome Agent:** Predictive trajectory analysis for intervention planning
- **Social Agent:** Community moderation and resource matching
- **Therapy Agent:** Personalized intervention recommendations
- **SRE Agent:** System health monitoring and observability

### 🎙️ **Vernacular Accessibility (Amazon Polly)**
- Text-to-speech for questionnaires in 8+ Indian languages
- Hindi, Hinglish, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati support
- Real-time audio synthesis for accessibility
- Low-bandwidth optimized for Tier-2/3 cities

### 🎥 **Advanced Screening**
- Real-time computer vision analysis using MediaPipe
- Multi-modal data fusion (video + questionnaire + behavioral data)
- WebRTC-enabled live screening sessions
- Gaze tracking and social engagement metrics
- Automated risk scoring with confidence intervals

### ☁️ **AWS Native Architecture**
- **Amazon Bedrock:** Claude 3.5 Sonnet for clinical summaries (not GPT)
- **Amazon Polly:** Neural TTS for vernacular accessibility
- **Amazon S3:** Encrypted video and PDF report storage with SSE-KMS
- **AWS HealthLake:** FHIR R4 compliant data storage (future integration)
- **Amazon Transcribe:** Voice screening in Indian languages (future integration)
- **Region:** ap-south-1 (Mumbai) for data sovereignty

### 🏥 **Clinical Features**
- HL7 FHIR R4 compliant data export
- Professional PDF report generation
- Multi-tenant organization support
- Role-based access control (Parent, Clinician, Admin)
- PII encryption (AES-256) for all sensitive data
- Longitudinal progress tracking

### 🔒 **Security & Compliance**
- JWT-based authentication
- Rate limiting on sensitive endpoints
- SSL/TLS encryption
- HIPAA-aware architecture
- Audit logging
- Data isolation by organization

### 🌐 **Modern Tech Stack**
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy
- **Database:** PostgreSQL with encrypted PII fields
- **Cache/Queue:** Redis + Celery for async processing
- **AI/ML:** Amazon Bedrock (Claude 3.5 Sonnet), Scikit-learn, MediaPipe
- **AWS Services:** Bedrock, Polly, S3, HealthLake (planned), Transcribe (planned)
- **Standards:** FHIR R4, OAuth2, OpenAPI
- **Deployment:** AWS Amplify (Frontend), Render/AWS (Backend)

---

## 📁 **Project Structure**

```
tarang-autism/
├── tarang-api/              # FastAPI Backend
│   ├── app/
│   │   ├── agents/          # 6 specialized AI agents
│   │   │   ├── screening_ml.py
│   │   │   ├── clinical.py
│   │   │   ├── outcome.py
│   │   │   ├── social.py
│   │   │   ├── therapy.py
│   │   │   └── clinician.py
│   │   ├── config.py        # Centralized configuration
│   │   ├── database.py      # SQLAlchemy models + encryption
│   │   ├── fhir.py          # FHIR R4 export mapper
│   │   ├── main.py          # API endpoints
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── security.py      # JWT auth + password hashing
│   │   ├── worker.py        # Celery background tasks
│   │   └── reports.py       # PDF generation
│   ├── tests/               # Test suite
│   ├── Dockerfile           # Production container
│   ├── requirements.txt     # Python dependencies
│   └── start.sh             # Startup script (API + Worker)
│
├── tarang-web/              # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App router (Next.js 15)
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── login/                      # Authentication
│   │   │   ├── register/                   # User registration
│   │   │   ├── dashboard/                  # User dashboard
│   │   │   ├── screening/                  # Screening interface
│   │   │   │   └── live/[id]/              # WebRTC live sessions
│   │   │   ├── reports/                    # Report archive
│   │   │   │   └── [id]/                   # Detailed report view
│   │   │   ├── community/                  # Parent community
│   │   │   ├── clinical/                   # Clinician tools
│   │   │   │   └── intervention/           # Intervention tracking
│   │   │   └── profile/                    # User profile
│   │   ├── components/      # Reusable React components
│   │   │   ├── Navbar.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── context/         # React Context (Auth)
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── use-mediapipe.ts
│   │   ├── lib/             # Utilities
│   │   │   └── utils.ts
│   │   └── types/           # TypeScript definitions
│   │       └── index.ts
│   ├── public/              # Static assets
│   ├── Dockerfile           # Production container
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore              # Prevents secret leaks
├── .env.example            # Configuration template
├── docker-compose.yml      # Local development setup
├── README.md               # This file
└── DEPLOYMENT.md           # Production deployment guide
```

---

## 🚀 **Quick Start**

### **Option 1: Local Development with Docker (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/SRG2004/tarang-autism.git
cd tarang-autism

# 2. Copy environment template
cp .env.example .env

# 3. Generate secure secrets
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32)[:32])"
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(64))"

# 4. Update .env with your secrets

# 5. Start all services
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Interactive API: http://localhost:8000/redoc

### **Option 2: Production Deployment**

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete step-by-step production deployment guide using:
- **Vercel** (Frontend)
- **Render** (Backend)
- **Neon** (PostgreSQL)
- **Upstash** (Redis)

All services offer **free tiers** suitable for demos and small-scale deployments.

---

## 🔧 **Configuration**

### **Backend Environment Variables**

Create `tarang-api/.env`:

```env
# Security (REQUIRED)
ENVIRONMENT=production
SECRET_KEY=your-32-byte-encryption-key
JWT_SECRET=your-64-char-jwt-secret

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Redis (REQUIRED for background tasks)
REDIS_URL=redis://default:password@host:port

# AWS Configuration (REQUIRED for AI features)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1

# AWS Services (Optional - for future features)
HEALTHLAKE_DATASTORE_ID=your-healthlake-datastore-id
S3_BUCKET_NAME=tarang-screening-data

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### **Frontend Environment Variables**

Create `tarang-web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, set to your backend URL: `https://your-api-domain.com`

---

## 🎨 **Architecture Overview**

### **AWS-Powered Multi-Agent System**

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (Next.js on AWS Amplify)           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Screening  │  │  Dashboard   │  │  Community   │  │
│  │  Interface  │  │  & Reports   │  │   Portal     │  │
│  │  + Polly    │  │              │  │              │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS/WSS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (FastAPI on Render/AWS)         │
│                  JWT Auth + Rate Limiting                │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
┌───────────────┐ ┌────────────┐ ┌─────────────┐
│  Screening    │ │  Clinical  │ │   Outcome   │
│    Agent      │ │   Agent    │ │    Agent    │
│               │ │            │ │             │
│ ML Risk Score │ │ Bedrock    │ │ Trajectory  │
│ Vision + Q&A  │ │ Claude 3.5 │ │ Prediction  │
└───────────────┘ └────────────┘ └─────────────┘
        │              │               │
        └──────────────┼───────────────┘
                       ▼
           ┌───────────────────────┐
           │  PostgreSQL Database  │
           │  (Encrypted PII)      │
           │  + AWS HealthLake     │
           └───────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Amazon S3    │ │ Amazon   │ │ Redis +      │
│ (Videos/PDFs)│ │ Polly    │ │ Celery       │
│ SSE-KMS      │ │ (TTS)    │ │ (Async)      │
└──────────────┘ └──────────┘ └──────────────┘
```

### **Key Workflows**

#### **1. Screening Flow**
```
User Input → Vision Analysis (MediaPipe) → Questionnaire → 
ML Agent (Risk Score) → Clinical Agent (Bedrock Claude 3.5) → 
FHIR Export → Database Storage → S3 (PDF/Video)
```

#### **2. Accessibility Flow (NEW)**
```
Question Display → User Clicks "Read Aloud" → 
FastAPI /polly/synthesize → Amazon Polly (Neural TTS) → 
MP3 Stream → Browser Audio Playback
```

#### **3. Live Session Flow**
```
WebRTC Connection → JWT Auth → Video Stream → 
Real-time Analysis → Engagement Metrics → Session Summary
```

#### **4. Report Generation Flow**
```
Screening Data → Clinical Agent (Bedrock) → PDF Generation → 
FHIR R4 Mapping → S3 Upload → Secure Download
```

---

## 🧪 **API Endpoints**

### **Authentication**
- `POST /auth/token` - Login (rate limited: 5/min)
- `POST /auth/register` - User registration
- `POST /auth/demo/{role}` - Demo login (prototype)

### **Screening**
- `POST /screening/process` - Process screening session
- `GET /reports` - List all reports
- `GET /reports/{id}/download` - Download PDF report
- `GET /reports/{id}/fhir` - Export FHIR R4 format

### **AWS Services (NEW)**
- `POST /polly/synthesize` - Text-to-speech synthesis (Amazon Polly)
  - Supports: Hindi, English (India), Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati
  - Returns: MP3 audio stream

### **Analytics**
- `GET /analytics/prediction/{patient_name}` - Get risk trajectory
- `GET /clinical/drift/{patient_id}` - Intervention efficacy analysis

### **Community**
- `GET /community` - List community posts
- `POST /community/post` - Create post (moderated)
- `POST /community/help` - AI resource matching

### **Admin**
- `POST /organizations` - Create organization
- `POST /patients` - Register patient (encrypted PII)
- `GET /patients` - List organization patients

### **WebSocket**
- `WS /ws/screening/{room_id}` - WebRTC signaling (JWT auth required)

**Full API Documentation:** `http://localhost:8000/docs`

---

## 🔐 **Security Features**

### **Implemented**
✅ JWT-based authentication with 1-hour expiration  
✅ Rate limiting (5 requests/min on login)  
✅ PII encryption (AES-256) in database  
✅ SSL/TLS for all communications  
✅ WebSocket authentication  
✅ CORS configuration  
✅ SQL injection protection (SQLAlchemy ORM)  
✅ Password hashing (bcrypt)  
✅ Structured logging (CWE-117 mitigation)  
✅ Input validation (Pydantic)  
✅ Multi-tenant data isolation  
✅ Role-based access control  

### **Best Practices**
- Environment variables for secrets (never hardcoded)
- `.gitignore` prevents secret commits
- Separate dev/prod configurations
- Health check endpoints for monitoring
- Comprehensive error handling

---

## 🧬 **ML & AI Features**

### **Screening ML Model**
- **Dataset:** UCI Autism Screening Adult Dataset
- **Algorithm:** Random Forest Classifier
- **Features:** 10 behavioral indicators + demographic data
- **Accuracy:** ~90% on validation set
- **Fallback:** Rule-based system if model unavailable

### **Computer Vision**
- **Framework:** MediaPipe Tasks-Vision
- **Analysis:** Gaze tracking, social engagement, attention metrics
- **Real-time:** <100ms inference on video frames

### **Data Fusion**
- Weighted combination: 40% ML model + 35% vision + 25% questionnaire
- Dissonance detection for conflicting signals
- Confidence scoring based on data quality

---

## 📊 **Technology Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1 | React framework |
| React | 19.0 | UI library |
| TypeScript | 5.0+ | Type safety |
| Tailwind CSS | 4.0 | Styling |
| Framer Motion | 12.29 | Animations |
| Zustand | 4.5 | State management |
| MediaPipe | 0.10.32 | Computer vision |
| Recharts | 3.7 | Data visualization |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.100+ | API framework |
| Python | 3.11+ | Language |
| SQLAlchemy | 2.0+ | ORM |
| PostgreSQL | 15+ | Database |
| Redis | 7+ | Cache/Queue |
| Celery | 5.3+ | Background tasks |
| Scikit-learn | 1.3+ | ML models |
| Pydantic | 2.0+ | Validation |
| ReportLab | 4.0+ | PDF generation |
| boto3 | 1.34+ | AWS SDK |
| aws-lambda-powertools | 2.0+ | AWS utilities |

### **AWS Services**
| Service | Purpose |
|---------|---------|
| Amazon Bedrock | Claude 3.5 Sonnet for clinical summaries |
| Amazon Polly | Neural TTS for vernacular accessibility |
| Amazon S3 | Encrypted storage (videos, PDFs) |
| AWS HealthLake | FHIR R4 data store (planned) |
| Amazon Transcribe | Voice screening (planned) |
| AWS Amplify | Frontend hosting + CI/CD |

### **DevOps**
- Docker & Docker Compose
- GitHub Actions (CI/CD ready)
- AWS Amplify (Frontend deployment)
- Render (Backend deployment)
- Neon (Database hosting)
- Upstash (Redis hosting)

---

## 🧪 **Testing**

### **Run Backend Tests**
```bash
cd tarang-api
pip install pytest pytest-asyncio
pytest tests/ -v
```

### **Run Frontend Tests**
```bash
cd tarang-web
npm install
npm test
```

---

## 📖 **Documentation**

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[API Docs](http://localhost:8000/docs)** - Interactive API documentation (Swagger)
- **[ReDoc](http://localhost:8000/redoc)** - Alternative API documentation
- **`.env.example`** - Environment configuration templates

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Commit Convention**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 🛣️ **Roadmap**

### **Phase 1: Core Platform** ✅
- [x] Multi-agent AI system
- [x] User authentication & authorization
- [x] Screening interface with video analysis
- [x] Report generation & FHIR export
- [x] Multi-tenant organization support
- [x] Community features

### **Phase 2: Advanced Features** 🚧
- [x] Amazon Bedrock integration (Claude 3.5 Sonnet)
- [x] Amazon Polly text-to-speech (8+ Indian languages)
- [ ] Amazon Transcribe voice screening
- [ ] AWS HealthLake FHIR R4 integration
- [ ] Amazon S3 video storage with encryption
- [ ] Mobile app (React Native)
- [ ] Offline screening support
- [ ] Advanced analytics dashboard
- [ ] Telemedicine integration

### **Phase 3: Enterprise** 📋
- [ ] HIPAA compliance certification
- [ ] Enterprise SSO (SAML, OAuth2)
- [ ] Advanced audit logging
- [ ] White-label customization
- [ ] API rate limiting tiers
- [ ] SLA monitoring

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

Built with ❤️ by the TARANG team for improved autism care accessibility.

**GitHub:** https://github.com/SRG2004/tarang-autism

---

## 🙏 **Acknowledgments**

- **UCI Machine Learning Repository** - Autism Screening Adult Dataset
- **MediaPipe** - Computer vision framework
- **HL7 FHIR** - Healthcare interoperability standards
- **OpenAI** - Moderation API inspiration
- **Open Source Community** - All the amazing libraries we use

---

## 📞 **Support**

- **Issues:** [GitHub Issues](https://github.com/SRG2004/tarang-autism/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SRG2004/tarang-autism/discussions)
- **Email:** support@tarang.health (if applicable)

---

## ⚠️ **Disclaimer**

TARANG is a clinical decision support tool and should **not** replace professional medical diagnosis. All screening results should be reviewed by qualified healthcare professionals. This platform is designed to assist, not replace, clinical judgment.

---

## 🌟 **Star History**

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Made with 🧠 for better autism care accessibility**
