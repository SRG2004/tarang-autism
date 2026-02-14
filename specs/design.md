# System Design — TARANG AWS Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    AWS Amplify (CDN)                          │
│                  Next.js 15 Frontend                         │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│   │ Screening│  │Dashboard │  │Intelligence│  │Community │  │
│   │  + Video │  │+ Reports │  │ + Charts   │  │  Forum   │  │
│   └────┬─────┘  └────┬─────┘  └─────┬──────┘  └────┬─────┘  │
└────────┼─────────────┼──────────────┼───────────────┼────────┘
         │             │              │               │
         └─────────────┴──────┬───────┴───────────────┘
                              │ HTTPS (JWT Auth)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (ECS/EC2)                    │
│                 Rate Limiting + RBAC                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Agent Orchestrator                     │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Screening  │  │   Clinical   │  │   Outcome    │  │  │
│  │  │    Agent    │  │    Agent     │  │    Agent     │  │  │
│  │  │ (scikit-ML) │  │  (Bedrock)   │  │  (numpy)     │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  │         │                │                  │          │  │
│  │  ┌──────┴──────┐  ┌──────┴───────┐  ┌──────┴───────┐  │  │
│  │  │   Social    │  │   Therapy    │  │     SRE      │  │  │
│  │  │    Agent    │  │    Agent     │  │    Agent     │  │  │
│  │  │  (Bedrock)  │  │  (Bedrock)   │  │  (Monitor)   │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────┬──────────┬──────────┬──────────┬─────────────────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
┌────────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
│  Amazon    │ │ Amazon │ │ Amazon │ │   Amazon     │
│  Bedrock   │ │   S3   │ │  RDS   │ │  HealthLake  │
│            │ │        │ │        │ │              │
│ Claude 3.5 │ │ Videos │ │Postgres│ │  FHIR R4     │
│  Sonnet    │ │ PDFs   │ │ Users  │ │  Clinical    │
│            │ │ Audio  │ │ Auth   │ │  Records     │
└────────────┘ └────────┘ └────────┘ └──────────────┘
        │                                    │
        ▼                                    ▼
┌────────────────┐                ┌──────────────────┐
│    Amazon      │                │    Amazon        │
│   Transcribe   │                │     Polly        │
│                │                │                  │
│ Voice → Text   │                │ Text → Speech    │
│ hi-IN, ta-IN   │                │ Neural Voices    │
│ Auto-detect    │                │ Aditi (Hindi)    │
└────────────────┘                └──────────────────┘
```

## Data Flow: Screening Session

```
1. Parent opens Screening Page
2. Frontend captures video via MediaPipe (client-side)
3. Parent answers AQ-10 (or uses Voice via Transcribe)
4. POST /screening/process
   ├── Video → S3 (SSE-KMS encrypted)
   ├── Questionnaire → Screening Agent (scikit-learn ML)
   ├── Risk Results → Clinical Agent (Bedrock Claude 3.5)
   │   └── Returns: key_findings, recommendation
   ├── Results → HealthLake (FHIR R4 DiagnosticReport)
   ├── PDF → ReportLab → S3
   └── Session → PostgreSQL (RDS)
5. Response → Frontend renders results
```

## Data Flow: FHIR Export

```
1. Clinician clicks "Export FHIR"
2. GET /reports/{id}/fhir
3. Backend constructs FHIR R4 DiagnosticReport
   ├── Uses fhir.resources library
   ├── Maps: risk_score → Observation
   ├── Maps: recommendation → Conclusion
   └── Maps: patient → Subject Reference
4. PUT to HealthLake datastore
5. Returns HealthLake resource ID
```

## Data Flow: Voice Screening

```
1. Parent taps "Voice Screening" (selects Hindi)
2. Frontend streams audio via WebSocket
3. Backend → Amazon Transcribe (streaming)
   ├── LanguageCode: hi-IN (or auto-detect)
   ├── Returns: transcribed text segments
4. NLP parser extracts structured answers
5. Answers feed into standard screening pipeline
6. Results returned normally
```

## Security Architecture

| Layer          | Mechanism                                      |
|----------------|------------------------------------------------|
| **Transport**  | TLS 1.3 (Amplify + ALB)                        |
| **Auth**       | JWT (1hr expiry, bcrypt passwords)              |
| **RBAC**       | `require_role()` — PARENT, CLINICIAN, ADMIN     |
| **Data at Rest**| RDS encryption, S3 SSE-KMS, HealthLake default |
| **PII**        | AES-256 column-level encryption (SQLAlchemy)    |
| **Region Lock**| All services in `ap-south-1` (Mumbai)           |
| **Audit**      | CloudTrail + structured logging                 |
