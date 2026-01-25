from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import io

class ReportGenerator:
    @staticmethod
    def generate_clinical_pdf(session_data: dict):
        """
        Generates a professional clinical PDF report for pediatric neurologists.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.hexColor("#0B3D33"),
            spaceAfter=20
        )
        
        elements = []
        
        # Header
        elements.append(Paragraph("TARANG CLINICAL FUSION REPORT", title_style))
        elements.append(Paragraph(f"Patient: {session_data.get('patient_name')}", styles['Normal']))
        elements.append(Paragraph(f"Date: {session_data.get('timestamp')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Risk Score Section
        risk_score = session_data.get('risk_score', 0)
        elements.append(Paragraph(f"OVERALL ASD RISK SCORE: {risk_score}%", styles['Heading2']))
        elements.append(Paragraph(f"Confidence Level: {session_data.get('confidence')}", styles['Normal']))
        elements.append(Spacer(1, 10))
        
        # Breakdown Table
        breakdown = session_data.get('breakdown', {})
        data = [
            ["Modality", "Score", "Weight"],
            ["Behavioral (Video)", f"{breakdown.get('behavioral')}%", "50%"],
            ["Developmental (Log)", f"{breakdown.get('questionnaire')}%", "40%"],
            ["Physiological (Simulated)", f"{breakdown.get('physiological')}%", "10%"]
        ]
        
        t = Table(data, colWidths=[200, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor("#0B3D33")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))
        
        # Clinical Recommendation
        elements.append(Paragraph("CLINICAL RECOMMENDATION", styles['Heading2']))
        elements.append(Paragraph(session_data.get('clinical_recommendation', "N/A"), styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
