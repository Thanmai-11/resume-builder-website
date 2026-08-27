"""Server-side PDF rendering for a resume's stored JSON payload.

This is a second export path alongside the client-side html2pdf.js
export in the React app -- useful when a user wants a PDF without
opening the browser preview (e.g. from an automation or the admin).
"""
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def render_resume_pdf(data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=18 * mm, bottomMargin=18 * mm,
        leftMargin=18 * mm, rightMargin=18 * mm,
    )
    styles = getSampleStyleSheet()
    name_style = ParagraphStyle("Name", parent=styles["Title"], fontSize=20, spaceAfter=2)
    contact_style = ParagraphStyle("Contact", parent=styles["Normal"], textColor=colors.grey)
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], spaceBefore=12, spaceAfter=4,
        textColor=colors.HexColor("#1f2937"),
    )
    body_style = styles["Normal"]

    story = []
    personal = data.get("personal", {})
    story.append(Paragraph(personal.get("name") or "Your Name", name_style))
    contact_bits = [personal.get(k) for k in ("email", "phone", "location", "link") if personal.get(k)]
    if contact_bits:
        story.append(Paragraph(" &nbsp;|&nbsp; ".join(contact_bits), contact_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", color=colors.HexColor("#d1d5db")))

    if data.get("summary"):
        story.append(Paragraph("Profile", section_style))
        story.append(Paragraph(data["summary"], body_style))

    education = data.get("education", [])
    if education:
        story.append(Paragraph("Education", section_style))
        for row in education:
            line = f"<b>{row.get('degree', '')}</b> — {row.get('institution', '')} " \
                   f"({row.get('year', '')}) {row.get('grade', '')}"
            story.append(Paragraph(line, body_style))

    experience = data.get("experience", [])
    if experience:
        story.append(Paragraph("Experience", section_style))
        for row in experience:
            line = f"<b>{row.get('title', '')}</b>, {row.get('company', '')} " \
                   f"({row.get('duration', '')})"
            story.append(Paragraph(line, body_style))
            if row.get("description"):
                story.append(Paragraph(row["description"], body_style))

    skills = data.get("skills", [])
    if skills:
        story.append(Paragraph("Skills", section_style))
        story.append(Paragraph(", ".join(skills), body_style))

    doc.build(story)
    return buffer.getvalue()
