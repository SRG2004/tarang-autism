# Migration Tasks — TARANG AWS Pivot

## Phase 1: Bedrock Agent Migration (Priority: Critical)

- [x] Add `boto3` to `requirements.txt`
- [x] Refactor `ClinicalSupportAgent` to use Bedrock Claude 3.5 Sonnet
- [x] Implement rule-based fallback in `_generate_rule_based()`
- [ ] Refactor `SocialAgent` to use Bedrock for content moderation
- [ ] Refactor `TherapyAgent` to use Bedrock for intervention recommendations
- [ ] Add `AWS_REGION` and `AWS_ACCESS_KEY_ID` to `.env.example`
- [ ] Test all 3 agents with Bedrock locally (`aws configure`)

## Phase 2: HealthLake Integration (Priority: High)

- [ ] Add `fhir.resources` to `requirements.txt`
- [ ] Create `app/healthlake.py` — HealthLake client wrapper
- [ ] Implement `export_to_healthlake(session_id)` function
  - [ ] Map `ScreeningSession` → FHIR `DiagnosticReport`
  - [ ] Map `Patient` → FHIR `Patient`
  - [ ] Map `risk_score` → FHIR `Observation`
- [ ] Add `POST /reports/{id}/healthlake` endpoint to `main.py`
- [ ] Create HealthLake datastore in `ap-south-1`
- [ ] Test FHIR export round-trip

## Phase 3: S3 Storage (Priority: High)

- [ ] Create `app/storage.py` — S3 upload/download helper
- [ ] Implement `upload_video(file, patient_id, session_id)` → S3 key
- [ ] Implement `upload_pdf(buffer, session_id)` → S3 key
- [ ] Implement `generate_presigned_url(s3_key, expires=3600)`
- [ ] Migrate PDF report generation to store in S3 (instead of filesystem)
- [ ] Create S3 bucket with SSE-KMS encryption policy
- [ ] Add bucket policy restricting access to application IAM role

## Phase 4: Voice Screening — Transcribe + Polly (Priority: Medium)

- [ ] Create `app/voice.py` — Transcribe + Polly wrapper
- [ ] Implement `transcribe_audio(audio_bytes, language)` function
  - [ ] Support languages: `hi-IN`, `ta-IN`, `te-IN`, `bn-IN`, `kn-IN`, `mr-IN`, `gu-IN`, `en-IN`
- [ ] Implement `synthesize_speech(text, language, voice_id)` function
  - [ ] Default voice: `Aditi` (Hindi Neural)
- [ ] Add `POST /screening/voice` endpoint for voice-based screening
- [ ] Add `GET /screening/questions/audio/{lang}` endpoint for Polly TTS
- [ ] Cache Polly audio in S3 to avoid re-generation
- [ ] Add language selector to frontend screening page

## Phase 5: Frontend + Amplify (Priority: Medium)

- [ ] Replace Vercel references in `next.config.ts` with Amplify
- [ ] Update CSP headers for Amplify domains
- [ ] Create `amplify.yml` build spec
- [ ] Configure Amplify app in `ap-south-1`
- [ ] Update `NEXT_PUBLIC_API_URL` for production
- [ ] Add voice screening UI components
- [ ] Add language selector dropdown (8 languages)

## Phase 6: README + Documentation (Priority: Low)

- [ ] Update `README.md` tech stack section to AWS-native
- [ ] Update architecture diagram to show Bedrock, HealthLake, S3
- [ ] Update deployment guide for AWS (replace Vercel/Render)
- [ ] Add AWS IAM policy examples
- [ ] Update `.env.example` with all AWS variables

## Verification Checklist

- [ ] `ClinicalAgent` generates summary via Bedrock (with fallback)
- [ ] FHIR export creates valid `DiagnosticReport` in HealthLake
- [ ] Video upload to S3 returns pre-signed URL
- [ ] Polly generates Hindi audio for AQ-10 questions
- [ ] Transcribe converts Hindi speech to text
- [ ] Frontend builds and deploys via Amplify
- [ ] All data stays within `ap-south-1`
