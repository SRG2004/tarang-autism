import os
import json
import logging
import datetime
from botocore.exceptions import ClientError
from app.core.aws_client import aws_client_manager

logger = logging.getLogger(__name__)


class ClinicalSupportAgent:
    def __init__(self):
        self.name = "Tarang Clinical Support Agent"
        self.role = "Generates evidence summaries for clinicians via AWS Bedrock"
        self.model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
        self.region = os.getenv("AWS_REGION", "us-east-1")

        # Use centralized AWS client manager
        self.bedrock = aws_client_manager.get_bedrock_client()
        if self.bedrock:
            logger.info(f"Bedrock client initialized via AWSClientManager (region={self.region})")
        else:
            logger.warning("Bedrock client unavailable. Will use rule-based fallback.")

    def generate_summary(self, patient_data: dict, risk_results: dict):
        """
        Synthesizes multimodal screening data into clinical insights.
        Uses AWS Bedrock (Claude 3 Sonnet) with rule-based fallback.
        """
        if self.bedrock:
            try:
                return self._generate_via_bedrock(patient_data, risk_results)
            except Exception as e:
                logger.error(f"Bedrock inference failed: {e}. Falling back to rule-based.")

        return self._generate_rule_based(patient_data, risk_results)

    def _generate_via_bedrock(self, patient_data: dict, risk_results: dict):
        system_prompt = (
            "You are an expert developmental pediatrician creating a clinical summary "
            "from autism screening data. Analyze the provided patient data and risk results, "
            "then produce a structured JSON response. Be concise, evidence-based, and actionable. "
            "Respond ONLY with valid JSON matching this exact schema:\n"
            "{\n"
            '  "summary_title": "string",\n'
            '  "key_findings": ["string", ...],\n'
            '  "clinical_recommendation": "string",\n'
            '  "agent_status": "Bedrock Claude 3 Sonnet"\n'
            "}"
        )

        user_prompt = (
            f"Patient Data:\n{json.dumps(patient_data, indent=2, default=str)}\n\n"
            f"Risk Assessment Results:\n{json.dumps(risk_results, indent=2, default=str)}\n\n"
            "Generate a clinical evidence summary with key findings and a recommendation."
        )

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3
        })

        response = self.bedrock.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=body
        )

        response_body = json.loads(response["body"].read())
        raw_text = response_body["content"][0]["text"]

        # Parse JSON from response (handle markdown code blocks)
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(cleaned)

        result["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
        if "agent_status" not in result:
            result["agent_status"] = "Bedrock Claude 3 Sonnet"

        return result

    def _generate_rule_based(self, patient_data: dict, risk_results: dict):
        """Original rule-based fallback logic."""
        risk_score = risk_results.get("risk_score", 0)
        confidence = risk_results.get("confidence", "Unknown")
        interpretation = risk_results.get("interpretation", "Unknown")
        breakdown = risk_results.get("breakdown", {})

        findings = []
        if breakdown.get("behavioral", 0) > 60:
            findings.append("Vision Engine: Detected significant deviation in eye-contact and motor markers.")
        if breakdown.get("questionnaire", 0) > 60:
            findings.append("Developmental Log: High correlation with clinically recognized early-risk behaviors.")
        if risk_results.get("dissonance_factor", 0) > 0.5:
            findings.append("CAUTION: High dissonance detected between vision markers and parent logs.")

        recommendation = f"Status: {interpretation}. "
        if risk_score > 70:
            recommendation += "Immediate referral to a Pediatric Neurologist for formal diagnostic assessment is strongly advised."
        elif risk_score > 40:
            recommendation += "Recommend a follow-up screening in 4 weeks and a consultation with a developmental specialist."
        else:
            recommendation += "Low risk indicators detected. Continue standard longitudinal monitoring."

        if "Low" in str(confidence):
            recommendation += " Note: Results should be interpreted with caution due to low signal alignment."

        return {
            "summary_title": f"Clinical Evidence Summary: {patient_data.get('name', 'Patient')}",
            "key_findings": findings,
            "clinical_recommendation": recommendation,
            "agent_status": "Rule-Based Fallback",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
