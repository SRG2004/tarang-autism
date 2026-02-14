# Tech Stack — TARANG (AI for Bharat)

## Core

| Layer       | Technology           | Purpose                                |
|-------------|----------------------|----------------------------------------|
| **Runtime** | Python 3.11+         | Backend language                       |
| **API**     | FastAPI + Uvicorn    | REST API framework                     |
| **ORM**     | SQLAlchemy 2.0       | Database abstraction                   |
| **Validation** | Pydantic v2       | Request/response schemas               |
| **Frontend** | Next.js 15 + React 19 | Web application                     |
| **Hosting** | AWS Amplify          | Frontend CDN + CI/CD                   |

## AWS Services (Primary)

| Service              | Usage                                           |
|----------------------|-------------------------------------------------|
| **Amazon Bedrock**   | Claude 3.5 Sonnet — Clinical & Social Agents    |
| **AWS HealthLake**   | FHIR R4 data store (replaces raw Postgres JSON) |
| **Amazon Transcribe**| Hinglish + 8 Indian language voice screening    |
| **Amazon Polly**     | Read-aloud questionnaires for accessibility     |
| **Amazon S3**        | Encrypted video + PDF report storage            |
| **Amazon RDS**       | PostgreSQL for user/auth data                   |
| **Amazon ElastiCache**| Redis for Celery task queue                    |

## SDK & Libraries

- `boto3` — AWS SDK for Python
- `aws-lambda-powertools` — Structured logging, tracing, metrics
- `fhir.resources` — FHIR R4 Pydantic models
- `scikit-learn` — ML screening model
- `mediapipe` — Client-side computer vision

## Environment Variables (Required)

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
HEALTHLAKE_DATASTORE_ID=
S3_BUCKET_NAME=tarang-screening-data
DATABASE_URL=postgresql://...
SECRET_KEY=
JWT_SECRET=
```
