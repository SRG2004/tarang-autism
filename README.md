# TARANG: Enterprise AI Care Continuum
**Full-Scale Industrial Autism Care & Screening Platform**

## 📁 Structure
- `/tarang-web`: Next.js 14 Frontend (Vision Engine, Dashboard, Screening).
- `/tarang-api`: FastAPI Backend (4-Agent Orchestration, Fusion Logic).

## 🚀 Deployment (Industrial Mode)

TARANG is fully containerized for enterprise deployment. Ensure **Docker** and **Docker Compose** are installed.

```bash
docker-compose up --build
```
This single command orchestrates:
- **Next.js 14** Production Frontend.
- **FastAPI** Heavy-duty AI Backend.
- **Celery** Background Workers for AI Fusion.
- **PostgreSQL** for Secure Clinical Records.
- **Redis** for Task Brokering & Caching.

## 🛠 Enterprise Features
- **Multimodal AI Fusion:** Weighted real-time vision + parental logs + simulated neuro-signals.
- **Async AI Pipeline:** Celery workers handle compute-heavy Transformers & Computer Vision.
- **JWT Security:** Industrial identity management with OAuth-compliant patterns.
- **Clinical Reports:** Automated professional PDF generation via the **Clinical Support Agent**.
- **Observability:** Centralized logging and health monitoring endpoints.
