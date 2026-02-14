# Requirements — TARANG AWS Migration (EARS Syntax)

## R1: Bedrock Clinical Agent

**WHEN** a screening session is completed and risk results are available,
**THE SYSTEM SHALL** invoke Amazon Bedrock (Claude 3.5 Sonnet) to generate a clinical evidence summary containing `key_findings` and `clinical_recommendation`.

**IF** the Bedrock API is unavailable or returns an error,
**THEN THE SYSTEM SHALL** fall back to the rule-based `_generate_rule_based()` method and log the failure.

## R2: Bedrock Social Agent

**WHEN** a community post is submitted,
**THE SYSTEM SHALL** invoke Amazon Bedrock to moderate the content for safety and relevance.

**IF** Bedrock moderation fails,
**THEN THE SYSTEM SHALL** mark the post as `is_safe=0` (pending manual review).

## R3: HealthLake FHIR Export

**WHEN** a clinician requests a FHIR export for a screening session,
**THE SYSTEM SHALL** construct a valid FHIR R4 `DiagnosticReport` using the `fhir.resources` library and push it to AWS HealthLake.

**WHEN** a FHIR export is successfully stored,
**THE SYSTEM SHALL** return the HealthLake resource ID to the frontend.

## R4: Video Upload to S3

**WHEN** a screening video recording is completed,
**THE SYSTEM SHALL** upload the video to Amazon S3 with `SSE-KMS` encryption and tag it with `patient_id` and `session_id`.

**THE SYSTEM SHALL** generate a pre-signed URL (valid 60 minutes) for clinician review.

## R5: Voice Screening (Transcribe)

**WHEN** a parent initiates a voice-based screening session,
**THE SYSTEM SHALL** stream audio to Amazon Transcribe with `LanguageCode=hi-IN` (Hindi) or auto-detect from `[hi-IN, ta-IN, te-IN, bn-IN, kn-IN, mr-IN, gu-IN, en-IN]`.

**WHEN** the transcription is complete,
**THE SYSTEM SHALL** parse structured answers from the transcript and feed them into the screening pipeline.

## R6: Questionnaire Read-Aloud (Polly)

**WHEN** a parent selects "Read Aloud" on the AQ-10 questionnaire,
**THE SYSTEM SHALL** invoke Amazon Polly with `Engine=neural` and the selected language voice (e.g., `Aditi` for Hindi) to generate audio for each question.

**THE SYSTEM SHALL** cache generated audio in S3 to avoid repeated Polly invocations.

## R7: Amplify Deployment

**WHEN** the frontend code is pushed to the `main` branch,
**THE SYSTEM SHALL** trigger an AWS Amplify build and deploy to the production domain.

## R8: Data Residency

**THE SYSTEM SHALL** store all PII and screening data exclusively in `ap-south-1` (Mumbai).

**THE SYSTEM SHALL NOT** transmit unencrypted PII outside the `ap-south-1` region.
