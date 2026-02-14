from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import io
import json

class ReportGenerator:
    @staticmethod
    def generate_clinical_pdf(session_data: dict):
        """
        Generates a professional clinical PDF report for pediatric neurologists.
        """
        buffer = io.BytesIO()
        try:
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Custom Styles
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor("#0B3D33"),
                spaceAfter=20
            )
            
            elements = []
            
            # Header
            elements.append(Paragraph("TARANG CLINICAL FUSION REPORT", title_style))
            elements.append(Paragraph(f"Patient: {session_data.get('patient_name', 'N/A')}", styles['Normal']))
            elements.append(Paragraph(f"Date: {session_data.get('timestamp', 'N/A')}", styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Risk Score Section
            risk_score = session_data.get('risk_score', 0)
            elements.append(Paragraph(f"OVERALL ASD RISK SCORE: {risk_score}%", styles['Heading2']))
            elements.append(Paragraph(f"Confidence Level: {session_data.get('confidence', 'N/A')}", styles['Normal']))
            elements.append(Spacer(1, 10))
            
            # Parse breakdown (may be JSON string or dict)
            breakdown = session_data.get('breakdown', {})
            if isinstance(breakdown, str):
                try:
                    breakdown = json.loads(breakdown)
                except (json.JSONDecodeError, TypeError):
                    breakdown = {}
            if not isinstance(breakdown, dict):
                breakdown = {}
            
            # Breakdown Table
            data = [
                ["Modality", "Score", "Weight"],
                ["Behavioral (Video)", f"{breakdown.get('behavioral', 'N/A')}%", "50%"],
                ["Developmental (Log)", f"{breakdown.get('questionnaire', 'N/A')}%", "40%"],
                ["Physiological (Simulated)", f"{breakdown.get('physiological', 'N/A')}%", "10%"]
            ]
            
            t = Table(data, colWidths=[200, 100, 100])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0B3D33")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 20))
            
            # Clinical Recommendation
            elements.append(Paragraph("CLINICAL RECOMMENDATION", styles['Heading2']))
            recommendation = session_data.get('clinical_recommendation', 'N/A')
            if not isinstance(recommendation, str):
                recommendation = str(recommendation) if recommendation else 'N/A'
            elements.append(Paragraph(recommendation, styles['Normal']))
            
            doc.build(elements)
        except Exception as e:
            # Fallback: generate a minimal PDF so endpoint never 500s
            buffer = io.BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)
            c.drawString(72, 750, "TARANG REPORT")
            c.drawString(72, 730, f"Risk Score: {session_data.get('risk_score', 'N/A')}%")
            c.drawString(72, 710, f"Patient: {session_data.get('patient_name', 'N/A')}")
            c.drawString(72, 690, f"Error generating full report: {str(e)[:80]}")
            c.save()
        
        buffer.seek(0)
        return buffer
