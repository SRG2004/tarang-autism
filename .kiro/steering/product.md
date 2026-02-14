# Product Vision — TARANG: AI for Bharat

## Mission

Bridge the autism diagnosis gap in India by making early screening **accessible, affordable, and multilingual** — empowering parents in Tier-2/3 cities who lack access to developmental pediatricians.

## Core Principles

1. **Vernacular First**: All parent-facing interactions support Hindi, Hinglish, Tamil, Telugu, Bengali, Kannada, Marathi, and Gujarati via Amazon Transcribe + Polly.
2. **Accessibility Over Features**: A parent with a ₹8,000 smartphone and 2G data should complete a screening in under 10 minutes.
3. **Clinical Rigor**: Every AI-generated insight includes confidence scores, evidence citations, and a fallback to rule-based logic if models fail.
4. **Data Sovereignty**: All PII stays within `ap-south-1` (Mumbai). FHIR R4 compliance for hospital interoperability.
5. **Zero-Config Start**: Parents register and screen without needing a clinician invitation.

## Target Users

| Persona      | Pain Point                                           | TARANG Solution                            |
|-------------|------------------------------------------------------|--------------------------------------------|
| **Parent**  | No nearby specialist; 6-month waitlists              | AI screening in 10 min from home           |
| **ASHA Worker** | Paper forms, no digital tools                    | Voice-guided screening in local language   |
| **Pediatrician** | Subjective checklists, no longitudinal data     | AI evidence summaries + trajectory charts  |
| **PHC Admin** | No visibility into district-level ASD prevalence   | Center analytics dashboard                 |

## Key Differentiators (Hackathon Judges)

- **Amazon Bedrock**: Claude 3.5 Sonnet generates clinical summaries — not GPT.
- **HealthLake**: Native FHIR R4 storage, not bolted-on JSON export.
- **Transcribe + Polly**: True vernacular accessibility, not just i18n string tables.
- **S3 Encrypted**: Screening videos stored with SSE-KMS, audit-logged.
- **India-First Architecture**: `ap-south-1` region, Hinglish language model, ₹0 cost to parents.
