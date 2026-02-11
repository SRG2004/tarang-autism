from datetime import datetime
from typing import Dict, Any
from app.database import ScreeningSession

class FHIRMapper:
    """
    Translates TARANG internal screening data into HL7 FHIR R4 standard resources.
    Targets DiagnosticReport and Observation for clinical interoperability.
    """
    
    @staticmethod
    def to_observation(session: ScreeningSession) -> Dict[str, Any]:
        """
        Maps a screening session to a FHIR Observation resource for the risk score.
        """
        return {
            "resourceType": "Observation",
            "id": f"tarang-obs-{session.id}",
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "survey",
                            "display": "Survey"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "80321-3",
                        "display": "Autism screening panel"
                    }
                ],
                "text": "Multimodal Autism Screening Risk Score"
            },
            "subject": {
                "display": session.patient_name
            },
            "effectiveDateTime": session.created_at.isoformat() if session.created_at else datetime.utcnow().isoformat(),
            "valueQuantity": {
                "value": float(session.risk_score),
                "unit": "percent",
                "system": "http://unitsofmeasure.org",
                "code": "%"
            },
            "interpretation": [
                {
                    "text": session.interpretation or "No clinical interpretation provided"
                }
            ],
            "note": [
                {
                    "text": f"Confidence: {session.confidence}. Dissonance: {session.dissonance_factor:.2f}"
                }
            ]
        }

    @staticmethod
    def to_diagnostic_report(session: ScreeningSession) -> Dict[str, Any]:
        """
        Maps a screening session to a FHIR DiagnosticReport resource.
        """
        return {
            "resourceType": "DiagnosticReport",
            "id": f"tarang-report-{session.id}",
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                            "code": "PSYCH",
                            "display": "Psychiatry"
                        }
                    ]
                }
            ],
            "code": {
                "text": "TARANG Multimodal Autism Screening Summary"
            },
            "subject": {
                "display": session.patient_name
            },
            "effectiveDateTime": session.created_at.isoformat() if session.created_at else datetime.utcnow().isoformat(),
            "issued": datetime.utcnow().isoformat(),
            "conclusion": session.clinical_recommendation or "Recommended manual review by a clinical specialist.",
            "presentedForm": [
                {
                    "contentType": "application/json",
                    "data": None, # In production, this could be a base64 encoded link/payload
                    "url": f"/reports/{session.id}/detail"
                }
            ]
        }
