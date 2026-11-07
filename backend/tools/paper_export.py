"""
Paper export utilities: DOCX, Markdown, and PDF.
All libraries are open-source. PDF via reportlab. DOCX via python-docx.
Produces professionally formatted academic documents with cover pages,
table of contents, headers/footers, page numbers, and proper bibliography.
"""
import io
import os
import re
from datetime import date
from typing import Any, Dict, List, Optional


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _strip_markdown(text: str) -> str:
    """Convert basic markdown to plain text for DOCX/PDF body paragraphs."""
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'`(.*?)`', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    return text.strip()


def _safe_xml(text: str) -> str:
    """Escape characters that break ReportLab's XML parser."""
    return (
        text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def _today_str() -> str:
    return date.today().strftime("%B %d, %Y")


def _resolve_meta(paper_meta: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Return a normalised metadata dict with sensible defaults."""
    meta = paper_meta or {}
    return {
        "author_name":     (meta.get("author_name") or "").strip() or "Author",
        "institution":     (meta.get("institution") or "").strip(),
        "department":      (meta.get("department") or "").strip(),
        "submission_date": (meta.get("submission_date") or "").strip() or _today_str(),
        "academic_field":  (meta.get("academic_field") or meta.get("field") or "").strip(),
        "citation_style":  (meta.get("citation_style") or "APA 7").strip(),
        "abstract":        (meta.get("abstract") or "").strip(),
        "research_question": (meta.get("research_question") or "").strip(),
        "paper_type":      (meta.get("paper_type") or "General Academic Paper").strip(),
    }


# ─── Markdown Export ───────────────────────────────────────────────────────────

def export_markdown(
    title: str,
    sections: List[Dict[str, Any]],
    paper_meta: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    """Return a fully-structured academic paper as UTF-8 Markdown bytes."""
    meta = _resolve_meta(paper_meta)
    parts: List[str] = []

    # --- Front-matter block ---
    parts.append("---")
    parts.append(f"title: \"{title}\"")
    parts.append(f"author: \"{meta['author_name']}\"")
    if meta["institution"]:
        parts.append(f"institution: \"{meta['institution']}\"")
    if meta["department"]:
        parts.append(f"department: \"{meta['department']}\"")
    parts.append(f"date: \"{meta['submission_date']}\"")
    if meta["academic_field"]:
        parts.append(f"field: \"{meta['academic_field']}\"")
    parts.append(f"citation_style: \"{meta['citation_style']}\"")
    parts.append("---\n")

    # --- Title ---
    parts.append(f"# {title}\n")
    parts.append(f"**Author:** {meta['author_name']}  ")
    if meta["institution"]:
        parts.append(f"**Institution:** {meta['institution']}  ")
    if meta["department"]:
        parts.append(f"**Department:** {meta['department']}  ")
    parts.append(f"**Date:** {meta['submission_date']}  ")
    if meta["academic_field"]:
        parts.append(f"**Field:** {meta['academic_field']}  ")
    parts.append(f"**Citation Style:** {meta['citation_style']}  \n")

    # --- Abstract (standalone) ---
    if meta["abstract"]:
        parts.append("---\n")
        parts.append("## Abstract\n")
        parts.append(meta["abstract"] + "\n")

    # --- Table of Contents ---
    parts.append("---\n")
    parts.append("## Table of Contents\n")
    for idx, sec in enumerate(sections, 1):
        slug = re.sub(r'[^a-z0-9\s-]', '', sec.get("title", "").lower()).replace(" ", "-")
        parts.append(f"{idx}. [{sec.get('title', '')}](#{slug})")
    parts.append("\n---\n")

    # --- Sections ---
    for sec in sections:
        parts.append(f"\n## {sec.get('title', 'Section')}\n")
        content = (sec.get("content") or "").strip()
        if content:
            parts.append(content + "\n")
        else:
            parts.append("*[Content pending]*\n")

    # --- Sources appendix ---
    if sources:
        parts.append("\n---\n")
        parts.append("## Sources Used\n")
        for idx, src in enumerate(sources, 1):
            authors = src.get("authors", "Unknown Author")
            year = src.get("year", "n.d.")
            src_title = src.get("title", "Untitled")
            journal = src.get("journal", "")
            url = src.get("url", "")
            doi = src.get("doi", "")
            line = f"{idx}. {authors} ({year}). *{src_title}*."
            if journal:
                line += f" {journal}."
            if doi:
                line += f" https://doi.org/{doi}"
            elif url:
                line += f" {url}"
            parts.append(line)
        parts.append("")

    return "\n".join(parts).encode("utf-8")


# ─── DOCX Export ───────────────────────────────────────────────────────────────

def export_docx(
    title: str,
    sections: List[Dict[str, Any]],
    paper_meta: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    """Return a professionally formatted academic DOCX binary."""
    from docx import Document
    from docx.shared import Pt, Inches, RGBColor, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.style import WD_STYLE_TYPE
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    import copy

    meta = _resolve_meta(paper_meta)
    doc = Document()

    # ── Page setup: A4, 2.5cm margins ──────────────────────────────────────
    section_doc = doc.sections[0]
    section_doc.page_width  = Cm(21)
    section_doc.page_height = Cm(29.7)
    for attr in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(section_doc, attr, Cm(2.5))

    # ── Default paragraph style ────────────────────────────────────────────
    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(12)
    normal.paragraph_format.space_after = Pt(6)

    def _add_heading(text: str, level: int, color_hex: str = "1a1a2e"):
        p = doc.add_heading(text, level=level)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.runs[0] if p.runs else p.add_run(text)
        r, g, b = int(color_hex[0:2], 16), int(color_hex[2:4], 16), int(color_hex[4:6], 16)
        run.font.color.rgb = RGBColor(r, g, b)
        return p

    def _add_paragraph(text: str, style_name: str = "Normal", italic: bool = False, bold: bool = False,
                        align=WD_ALIGN_PARAGRAPH.JUSTIFY):
        p = doc.add_paragraph(style=style_name)
        p.alignment = align
        run = p.add_run(_strip_markdown(text))
        run.italic = italic
        run.bold = bold
        run.font.size = Pt(12)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(8)
        return p

    def _page_break():
        doc.add_page_break()

    # ── Header & Footer helper ─────────────────────────────────────────────
    def _setup_header_footer():
        hdr = section_doc.header
        hdr_para = hdr.paragraphs[0] if hdr.paragraphs else hdr.add_paragraph()
        hdr_para.clear()
        hdr_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        # Left: short title | Right: "ResearchForge"
        run_left = hdr_para.add_run(title[:60] + ("…" if len(title) > 60 else ""))
        run_left.font.size = Pt(9)
        run_left.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        run_tab = hdr_para.add_run("\t")
        run_right = hdr_para.add_run("ResearchForge")
        run_right.font.size = Pt(9)
        run_right.font.bold = True
        run_right.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

        ftr = section_doc.footer
        ftr_para = ftr.paragraphs[0] if ftr.paragraphs else ftr.add_paragraph()
        ftr_para.clear()
        ftr_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # Page number field
        run_ftr = ftr_para.add_run()
        fldChar1 = OxmlElement("w:fldChar")
        fldChar1.set(qn("w:fldCharType"), "begin")
        instrText = OxmlElement("w:instrText")
        instrText.set(qn("xml:space"), "preserve")
        instrText.text = "PAGE"
        fldChar2 = OxmlElement("w:fldChar")
        fldChar2.set(qn("w:fldCharType"), "end")
        run_ftr._r.append(fldChar1)
        run_ftr._r.append(instrText)
        run_ftr._r.append(fldChar2)
        run_ftr.font.size = Pt(9)
        run_ftr.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

    _setup_header_footer()

    # ═══════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════════
    for _ in range(6):
        doc.add_paragraph()  # vertical spacing

    # Institution
    if meta["institution"]:
        inst_p = doc.add_paragraph()
        inst_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        inst_run = inst_p.add_run(meta["institution"].upper())
        inst_run.font.size = Pt(13)
        inst_run.font.bold = True
        inst_run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
        if meta["department"]:
            dept_p = doc.add_paragraph()
            dept_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            dept_run = dept_p.add_run(meta["department"])
            dept_run.font.size = Pt(11)
            dept_run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
        doc.add_paragraph()

    # Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run(title)
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
    title_p.paragraph_format.space_before = Pt(18)
    title_p.paragraph_format.space_after = Pt(18)

    # Paper type subtitle
    if meta["paper_type"] and meta["paper_type"] != "General Academic Paper":
        sub_p = doc.add_paragraph()
        sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sub_run = sub_p.add_run(meta["paper_type"])
        sub_run.font.size = Pt(13)
        sub_run.font.italic = True
        sub_run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    # Divider line
    div_p = doc.add_paragraph()
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    div_run = div_p.add_run("─" * 30)
    div_run.font.color.rgb = RGBColor(0xcc, 0xcc, 0xcc)
    div_p.paragraph_format.space_before = Pt(18)
    div_p.paragraph_format.space_after = Pt(18)

    for _ in range(4):
        doc.add_paragraph()

    # Author block
    for label, value in [
        ("Author", meta["author_name"]),
        ("Field", meta["academic_field"]),
        ("Citation Style", meta["citation_style"]),
        ("Date", meta["submission_date"]),
    ]:
        if value:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_lbl = p.add_run(f"{label}: ")
            r_lbl.font.bold = True
            r_lbl.font.size = Pt(11)
            r_val = p.add_run(value)
            r_val.font.size = Pt(11)

    _page_break()

    # ═══════════════════════════════════════════════════════════════════════
    # ABSTRACT PAGE
    # ═══════════════════════════════════════════════════════════════════════
    if meta["abstract"]:
        _add_heading("Abstract", level=1, color_hex="1a1a2e")
        _add_paragraph(meta["abstract"])
        _page_break()

    # ═══════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS (manual)
    # ═══════════════════════════════════════════════════════════════════════
    _add_heading("Table of Contents", level=1, color_hex="1a1a2e")
    for idx, sec in enumerate(sections, 1):
        toc_p = doc.add_paragraph()
        toc_p.paragraph_format.space_after = Pt(4)
        toc_run = toc_p.add_run(f"{idx}.  {sec.get('title', 'Section')}")
        toc_run.font.size = Pt(11)
    _page_break()

    # ═══════════════════════════════════════════════════════════════════════
    # SECTIONS
    # ═══════════════════════════════════════════════════════════════════════
    MAJOR_SECTIONS = {"abstract", "introduction", "conclusion", "references", "bibliography"}

    for idx, sec in enumerate(sections):
        sec_key = sec.get("section_key", "").lower()
        sec_title = sec.get("title", "Section")
        content = (sec.get("content") or "").strip()

        level = 1 if (sec_key in MAJOR_SECTIONS or idx in (0, len(sections) - 1)) else 2
        _add_heading(sec_title, level=level, color_hex="1a1a2e")

        if content:
            for para_text in content.split("\n\n"):
                para_text = para_text.strip()
                if not para_text:
                    continue
                is_pending = "PENDING" in para_text[:40].upper()
                _add_paragraph(para_text, italic=is_pending)
        else:
            _add_paragraph("[Content pending]", italic=True)

        doc.add_paragraph()

    # ═══════════════════════════════════════════════════════════════════════
    # SOURCES / BIBLIOGRAPHY APPENDIX (if provided separately from sections)
    # ═══════════════════════════════════════════════════════════════════════
    if sources:
        _page_break()
        _add_heading("References", level=1, color_hex="1a1a2e")
        citation_style = meta["citation_style"].upper()

        for idx, src in enumerate(sources, 1):
            authors = src.get("authors", "Unknown Author")
            year = src.get("year", "n.d.")
            src_title = src.get("title", "Untitled")
            journal = src.get("journal", "")
            url = src.get("url", "")
            doi = src.get("doi", "")

            ref_p = doc.add_paragraph()
            ref_p.paragraph_format.left_indent = Inches(0.5)
            ref_p.paragraph_format.first_line_indent = Inches(-0.5)
            ref_p.paragraph_format.space_after = Pt(6)
            ref_p.paragraph_format.line_spacing = 1.0

            if "IEEE" in citation_style:
                line = f"[{idx}] {authors}, \"{src_title}\","
                if journal:
                    line += f" {journal},"
                line += f" {year}."
            elif "MLA" in citation_style:
                line = f"{authors}. \"{src_title}.\""
                if journal:
                    line += f" {journal},"
                line += f" {year}."
            else:  # APA default
                line = f"{authors} ({year}). {src_title}."
                if journal:
                    line += f" {journal}."

            ref_p.add_run(line).font.size = Pt(11)

            if doi or url:
                href = f"https://doi.org/{doi}" if doi else url
                # Add hyperlink
                rel_id = doc.part.relate_to(href, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
                hyperlink = OxmlElement("w:hyperlink")
                hyperlink.set(qn("r:id"), rel_id)
                hyp_run = OxmlElement("w:r")
                rPr = OxmlElement("w:rPr")
                color = OxmlElement("w:color")
                color.set(qn("w:val"), "0563C1")
                rStyle = OxmlElement("w:rStyle")
                rStyle.set(qn("w:val"), "Hyperlink")
                rPr.append(color)
                hyp_run.append(rPr)
                t = OxmlElement("w:t")
                t.set(qn("xml:space"), "preserve")
                t.text = f" {href}"
                hyp_run.append(t)
                hyperlink.append(hyp_run)
                ref_p._p.append(hyperlink)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ─── PDF Export ────────────────────────────────────────────────────────────────

def export_pdf(
    title: str,
    sections: List[Dict[str, Any]],
    paper_meta: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    """Return a professionally formatted academic PDF using ReportLab PLATYPUS."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, PageBreak,
        HRFlowable, Table, TableStyle, KeepTogether
    )
    from reportlab.platypus.tableofcontents import TableOfContents
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT

    meta = _resolve_meta(paper_meta)

    PAGE_W, PAGE_H = A4
    MARGIN = 2.5 * cm
    ACCENT = colors.HexColor("#1a1a2e")
    ACCENT2 = colors.HexColor("#2d4a8a")
    GREY = colors.HexColor("#555555")
    LIGHT_GREY = colors.HexColor("#999999")
    AMBER = colors.HexColor("#d97706")

    buf = io.BytesIO()
    page_state = {"num": 0, "total_pages": 0}

    # ── Header / Footer callbacks ──────────────────────────────────────────
    def _header_footer(canvas, doc):
        canvas.saveState()
        page_num = canvas.getPageNumber()
        short_title = title[:65] + ("…" if len(title) > 65 else "")

        if page_num > 1:  # Skip cover page
            # Header line
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(GREY)
            canvas.drawString(MARGIN, PAGE_H - MARGIN + 0.3 * cm, short_title)
            canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN + 0.3 * cm, "ResearchForge")
            canvas.setStrokeColor(colors.HexColor("#dddddd"))
            canvas.setLineWidth(0.5)
            canvas.line(MARGIN, PAGE_H - MARGIN + 0.15 * cm, PAGE_W - MARGIN, PAGE_H - MARGIN + 0.15 * cm)

            # Footer
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(GREY)
            canvas.drawCentredString(PAGE_W / 2, MARGIN - 0.5 * cm, f"— {page_num} —")
            canvas.line(MARGIN, MARGIN - 0.25 * cm, PAGE_W - MARGIN, MARGIN - 0.25 * cm)

        canvas.restoreState()

    def _cover_page(canvas, doc):
        canvas.saveState()
        canvas.restoreState()

    doc_obj = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN + 0.5 * cm,
        bottomMargin=MARGIN + 0.5 * cm,
    )

    styles = getSampleStyleSheet()

    def _style(name, **kwargs):
        return ParagraphStyle(name, parent=styles.get("Normal", styles["BodyText"]), **kwargs)

    cover_title_style = _style("CoverTitle", fontSize=24, leading=30, textColor=ACCENT,
                               fontName="Helvetica-Bold", alignment=TA_CENTER, spaceAfter=14)
    cover_sub_style  = _style("CoverSub", fontSize=13, leading=18, textColor=GREY,
                               fontName="Helvetica-Oblique", alignment=TA_CENTER, spaceAfter=8)
    cover_meta_style = _style("CoverMeta", fontSize=11, leading=16, textColor=GREY,
                               alignment=TA_CENTER, spaceAfter=5)
    cover_inst_style = _style("CoverInst", fontSize=13, leading=18, textColor=ACCENT,
                               fontName="Helvetica-Bold", alignment=TA_CENTER, spaceAfter=6)

    h1_style   = _style("H1",   fontSize=14, leading=20, textColor=ACCENT,
                         fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=10)
    h2_style   = _style("H2",   fontSize=12, leading=18, textColor=ACCENT2,
                         fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=7)
    body_style = _style("Body", fontSize=11, leading=17, alignment=TA_JUSTIFY,
                         spaceAfter=8, firstLineIndent=14)
    body_nb    = _style("BodyNB", fontSize=11, leading=17, alignment=TA_JUSTIFY,
                         spaceAfter=8)  # no indent
    pending_style = _style("Pending", fontSize=10, leading=14, textColor=AMBER,
                            fontName="Helvetica-Oblique", spaceAfter=6)
    toc_style  = _style("TOCEntry", fontSize=11, leading=16, spaceAfter=4)
    ref_style  = _style("Ref", fontSize=10, leading=14, leftIndent=18,
                         firstLineIndent=-18, spaceAfter=5)
    abs_style  = _style("Abstract", fontSize=11, leading=17, alignment=TA_JUSTIFY,
                         leftIndent=18, rightIndent=18, spaceAfter=8)

    story: List[Any] = []

    def _hr(color=colors.HexColor("#cccccc"), thickness=0.5, spaceB=6, spaceA=6):
        return HRFlowable(width="100%", thickness=thickness, color=color,
                          spaceAfter=spaceA, spaceBefore=spaceB)

    def _safe_para(text: str, style) -> Paragraph:
        cleaned = _safe_xml(_strip_markdown(text))
        try:
            return Paragraph(cleaned, style)
        except Exception:
            return Paragraph("(Content could not be rendered)", pending_style)

    # ═══════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 4 * cm))

    if meta["institution"]:
        story.append(Paragraph(_safe_xml(meta["institution"].upper()), cover_inst_style))
    if meta["department"]:
        story.append(Paragraph(_safe_xml(meta["department"]), cover_sub_style))

    story.append(Spacer(1, 1.5 * cm))
    story.append(_hr(ACCENT2, thickness=1.5))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(_safe_xml(title), cover_title_style))
    if meta["paper_type"] and meta["paper_type"] != "General Academic Paper":
        story.append(Paragraph(_safe_xml(meta["paper_type"]), cover_sub_style))
    story.append(Spacer(1, 0.4 * cm))
    story.append(_hr(ACCENT2, thickness=1.5))
    story.append(Spacer(1, 2 * cm))

    meta_rows = []
    if meta["author_name"] and meta["author_name"] != "Author":
        meta_rows.append(("Author", meta["author_name"]))
    if meta["academic_field"]:
        meta_rows.append(("Field", meta["academic_field"]))
    meta_rows.append(("Citation Style", meta["citation_style"]))
    meta_rows.append(("Date", meta["submission_date"]))

    for label, value in meta_rows:
        story.append(Paragraph(f"<b>{_safe_xml(label)}:</b>  {_safe_xml(value)}", cover_meta_style))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # ABSTRACT PAGE
    # ═══════════════════════════════════════════════════════════════════════
    if meta["abstract"]:
        story.append(Paragraph("Abstract", h1_style))
        story.append(_hr())
        story.append(Paragraph(_safe_xml(meta["abstract"]), abs_style))
        story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Table of Contents", h1_style))
    story.append(_hr())
    story.append(Spacer(1, 0.3 * cm))
    for idx, sec in enumerate(sections, 1):
        sec_title = sec.get("title", "Section")
        story.append(Paragraph(f"{idx}.  {_safe_xml(sec_title)}", toc_style))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTIONS
    # ═══════════════════════════════════════════════════════════════════════
    MAJOR_KEYS = {"abstract", "introduction", "conclusion", "references", "bibliography"}

    for idx, sec in enumerate(sections):
        sec_key = sec.get("section_key", "").lower()
        sec_title = sec.get("title", "Section")
        content = (sec.get("content") or "").strip()

        use_h1 = sec_key in MAJOR_KEYS or idx == 0 or idx == len(sections) - 1
        heading_style = h1_style if use_h1 else h2_style

        block: List[Any] = []
        block.append(Paragraph(_safe_xml(sec_title), heading_style))
        block.append(_hr(ACCENT if use_h1 else colors.HexColor("#b0b8d0")))
        block.append(Spacer(1, 0.15 * cm))

        if content:
            paras = content.split("\n\n")
            for i, para_text in enumerate(paras):
                para_text = para_text.strip()
                if not para_text:
                    continue
                is_pending = "PENDING" in para_text[:40].upper()
                style = pending_style if is_pending else (body_style if i > 0 else body_nb)
                block.append(_safe_para(para_text, style))
        else:
            block.append(Paragraph("(Content pending)", pending_style))

        block.append(Spacer(1, 0.3 * cm))
        story.extend(block)

        # Page break before major sections (except first and last)
        if use_h1 and idx > 0 and idx < len(sections) - 1:
            story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SOURCES BIBLIOGRAPHY APPENDIX
    # ═══════════════════════════════════════════════════════════════════════
    if sources:
        story.append(PageBreak())
        story.append(Paragraph("References", h1_style))
        story.append(_hr(ACCENT))
        story.append(Spacer(1, 0.2 * cm))
        citation_style = meta["citation_style"].upper()

        for idx, src in enumerate(sources, 1):
            authors = src.get("authors", "Unknown Author")
            year = src.get("year", "n.d.")
            src_title = src.get("title", "Untitled")
            journal = src.get("journal", "")
            url = src.get("url", "")
            doi = src.get("doi", "")

            if "IEEE" in citation_style:
                line = f"[{idx}] {authors}, &quot;{_safe_xml(src_title)}&quot;,"
                if journal:
                    line += f" <i>{_safe_xml(journal)}</i>,"
                line += f" {year}."
            elif "MLA" in citation_style:
                line = f"{_safe_xml(authors)}. &quot;{_safe_xml(src_title)}.&quot;"
                if journal:
                    line += f" <i>{_safe_xml(journal)}</i>,"
                line += f" {year}."
            else:  # APA default
                line = f"{_safe_xml(authors)} ({year}). <i>{_safe_xml(src_title)}</i>."
                if journal:
                    line += f" {_safe_xml(journal)}."

            href = f"https://doi.org/{doi}" if doi else url
            if href:
                line += f' <a href="{_safe_xml(href)}" color="#0563C1">{_safe_xml(href)}</a>'

            try:
                story.append(Paragraph(line, ref_style))
            except Exception:
                story.append(Paragraph(_strip_markdown(line), ref_style))

    # ── Build ──────────────────────────────────────────────────────────────
    doc_obj.build(
        story,
        onFirstPage=_header_footer,
        onLaterPages=_header_footer,
    )
    return buf.getvalue()


# ─── Research Session Report Export ───────────────────────────────────────────

def export_session_report_pdf(
    report: Dict[str, Any],
    session: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
    claims: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    """
    Generate a complete, professionally formatted downloadable PDF for a ResearchForge session.
    Includes executive summary, key findings, evidence synthesis, conflicting evidence,
    source quality breakdown, limitations, and hyperlinked bibliography.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm, mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, PageBreak,
        HRFlowable, Table, TableStyle, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT

    PAGE_W, PAGE_H = A4
    MARGIN = 2.0 * cm

    ACCENT = colors.HexColor("#0f172a")       # Slate 900
    ACCENT_BLUE = colors.HexColor("#1e40af")  # Blue 800
    WARM_AMBER = colors.HexColor("#b45309")   # Amber 700
    GREEN_TEXT = colors.HexColor("#065f46")   # Emerald 800
    GREEN_BG = colors.HexColor("#d1fae5")
    RED_TEXT = colors.HexColor("#991b1b")     # Red 800
    RED_BG = colors.HexColor("#fee2e2")
    DANGER_RED = colors.HexColor("#dc2626")
    AMBER_BG = colors.HexColor("#fef3c7")
    GREY_TEXT = colors.HexColor("#475569")    # Slate 600
    LIGHT_BG = colors.HexColor("#f8fafc")     # Slate 50
    CARD_BG = colors.HexColor("#f1f5f9")      # Slate 100
    BORDER_COLOR = colors.HexColor("#cbd5e1") # Slate 300

    buf = io.BytesIO()

    title = report.get("title") or (f"Research Report: {session.get('query')}" if session else "Research Report")
    clean_title = title.replace("Research Report: ", "").strip()
    query = session.get("query", clean_title) if session else clean_title
    mode = session.get("mode", "deep").capitalize() if session else "Deep"
    confidence = session.get("confidence", 0.0) if session else 0.0
    created_at = report.get("created_at") or session.get("created_at") or _today_str()
    if "T" in str(created_at):
        try:
            created_at = str(created_at).split("T")[0]
        except Exception:
            pass

    stats = session.get("statistics", {}) if session else {}
    sources_count = len(sources) if sources else stats.get("sources_relevant", 0)
    claims_count = len(claims) if claims else stats.get("claims_identified", 0)
    verified_count = stats.get("claims_verified", sum(1 for c in (claims or []) if c.get("status") in ["VERIFIED", "PARTIALLY VERIFIED"]))
    conflicts_count = stats.get("conflicts_detected", sum(1 for c in (claims or []) if c.get("status") == "CONTRADICTED" or len(c.get("contradicting_sources", [])) > 0))

    if confidence == 0.0 and stats.get("overall_confidence"):
        confidence = stats.get("overall_confidence", 0.0)

    # ── Header & Footer Callbacks ───────────────────────────────────────────
    def _session_header_footer(canvas, doc):
        canvas.saveState()
        page_num = canvas.getPageNumber()
        if page_num > 1:
            # Top running header
            canvas.setFont("Helvetica-Bold", 8)
            canvas.setFillColor(ACCENT)
            canvas.drawString(MARGIN, PAGE_H - MARGIN + 0.35 * cm, "RESEARCHFORGE")
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(GREY_TEXT)
            canvas.drawString(MARGIN + 2.8 * cm, PAGE_H - MARGIN + 0.35 * cm, f"//  {clean_title[:55]}{'...' if len(clean_title) > 55 else ''}")
            canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN + 0.35 * cm, str(created_at))

            canvas.setStrokeColor(BORDER_COLOR)
            canvas.setLineWidth(0.5)
            canvas.line(MARGIN, PAGE_H - MARGIN + 0.2 * cm, PAGE_W - MARGIN, PAGE_H - MARGIN + 0.2 * cm)

            # Bottom running footer
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(GREY_TEXT)
            canvas.drawString(MARGIN, MARGIN - 0.45 * cm, "Verified Multi-Agent Autonomous Research Ledger")
            canvas.drawRightString(PAGE_W - MARGIN, MARGIN - 0.45 * cm, f"Page {page_num}")
            canvas.line(MARGIN, MARGIN - 0.25 * cm, PAGE_W - MARGIN, MARGIN - 0.25 * cm)
        canvas.restoreState()

    doc_obj = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN + 0.4 * cm,
        bottomMargin=MARGIN + 0.4 * cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "SessionTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=25,
        textColor=ACCENT,
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        "SessionSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=GREY_TEXT,
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=ACCENT_BLUE,
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        "SessionBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=ACCENT,
        alignment=TA_JUSTIFY,
        spaceAfter=8
    )
    meta_pill_style = ParagraphStyle(
        "MetaPill",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=ACCENT,
        alignment=TA_CENTER
    )
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=GREY_TEXT,
        alignment=TA_CENTER
    )
    summary_box_style = ParagraphStyle(
        "SummaryBoxText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=ACCENT,
        alignment=TA_JUSTIFY
    )
    ref_style = ParagraphStyle(
        "SessionRef",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        leftIndent=15,
        firstLineIndent=-15,
        spaceAfter=5
    )

    story: List[Any] = []

    def _hr(color=BORDER_COLOR, thickness=0.75, spaceB=4, spaceA=8):
        return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=spaceA, spaceBefore=spaceB)

    # ── 1. Masthead & Title ─────────────────────────────────────────────────
    story.append(Paragraph("RESEARCHFORGE &bull; COMPREHENSIVE RESEARCH REPORT", ParagraphStyle(
        "BrandHeader", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=WARM_AMBER, spaceAfter=4
    )))
    story.append(Paragraph(_safe_xml(clean_title), title_style))
    story.append(Paragraph(f"Autonomous evidentiary synthesis for inquiry: <i>&ldquo;{_safe_xml(query)}&rdquo;</i>", subtitle_style))
    story.append(_hr(ACCENT, thickness=1.2))

    # ── 2. Telemetry / Metadata Bar ─────────────────────────────────────────
    conf_color_bg = GREEN_BG if confidence >= 70 else (AMBER_BG if confidence >= 50 else RED_BG)
    conf_color_text = GREEN_TEXT if confidence >= 70 else (WARM_AMBER if confidence >= 50 else RED_TEXT)
    conf_label = "HIGH CONFIDENCE" if confidence >= 70 else ("MODERATE CONFIDENCE" if confidence >= 50 else "CONTESTED")

    meta_cells = [
        [
            Paragraph(f"<b>{confidence}%</b>", ParagraphStyle("C1", parent=meta_pill_style, textColor=conf_color_text, fontSize=12, leading=14)),
            Paragraph(f"<b>{sources_count}</b>", ParagraphStyle("C2", parent=meta_pill_style, fontSize=12, leading=14)),
            Paragraph(f"<b>{verified_count}</b>", ParagraphStyle("C3", parent=meta_pill_style, fontSize=12, leading=14)),
            Paragraph(f"<b>{conflicts_count}</b>", ParagraphStyle("C4", parent=meta_pill_style, fontSize=12, leading=14)),
            Paragraph(f"<b>{mode}</b>", ParagraphStyle("C5", parent=meta_pill_style, fontSize=11, leading=14)),
            Paragraph(f"<b>{created_at}</b>", ParagraphStyle("C6", parent=meta_pill_style, fontSize=10, leading=14)),
        ],
        [
            Paragraph(conf_label, meta_label_style),
            Paragraph("Sources Analyzed", meta_label_style),
            Paragraph("Facts Verified", meta_label_style),
            Paragraph("Conflicts Detected", meta_label_style),
            Paragraph("Research Depth", meta_label_style),
            Paragraph("Date Generated", meta_label_style),
        ]
    ]
    usable_width = PAGE_W - 2 * MARGIN
    col_w = usable_width / 6.0
    meta_table = Table(meta_cells, colWidths=[col_w] * 6)
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, 0), conf_color_bg),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.4 * cm))

    # ── 3. Executive Summary Box ────────────────────────────────────────────
    exec_summary = report.get("executive_summary") or "This report compiles autonomous multi-source investigations across public and institutional data."
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(_hr())

    summary_table = Table(
        [[Paragraph(_safe_xml(exec_summary), summary_box_style)]],
        colWidths=[usable_width]
    )
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LINEBEFORE", (0, 0), (0, -1), 3.0, WARM_AMBER),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.4 * cm))

    # ── 4. Key Findings ─────────────────────────────────────────────────────
    key_findings = report.get("key_findings") or []
    if key_findings:
        story.append(Paragraph("2. Key Findings & Adjudicated Claims", h1_style))
        story.append(_hr())

        for idx, kf in enumerate(key_findings, 1):
            finding_text = kf.get("finding", "")
            f_conf = kf.get("confidence", 50)
            f_sources = kf.get("evidence_sources_count", 1)
            f_summary = kf.get("summary", "")

            badge_bg = GREEN_BG if f_conf >= 70 else (AMBER_BG if f_conf >= 50 else RED_BG)
            badge_txt = GREEN_TEXT if f_conf >= 70 else (WARM_AMBER if f_conf >= 50 else RED_TEXT)

            card_rows = [
                [
                    Paragraph(f"<b>Finding #{idx:02d}:</b> {_safe_xml(finding_text)}", ParagraphStyle("KFTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=ACCENT)),
                    Paragraph(f"<b>{f_conf}%</b> ({f_sources} sources)", ParagraphStyle("KFBadge", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=badge_txt, alignment=TA_RIGHT))
                ]
            ]
            if f_summary:
                card_rows.append([
                    Paragraph(_safe_xml(f_summary), ParagraphStyle("KFDesc", parent=styles["Normal"], fontName="Helvetica", fontSize=9, leading=13, textColor=GREY_TEXT)),
                    Paragraph("", styles["Normal"])
                ])

            finding_card = Table(card_rows, colWidths=[usable_width - 2.8 * cm, 2.8 * cm])
            finding_card.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("SPAN", (0, 1), (1, 1)) if len(card_rows) > 1 else ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("LINEBEFORE", (0, 0), (0, -1), 2.5, badge_txt),
            ]))
            story.append(finding_card)
            story.append(Spacer(1, 0.2 * cm))

        story.append(Spacer(1, 0.3 * cm))

    # ── 5. Detailed Evidence & Analysis ─────────────────────────────────────
    raw_markdown = report.get("full_markdown") or ""
    # Extract substantive sections from markdown if available
    section_map: Dict[str, str] = {}
    current_sec = ""
    for line in raw_markdown.splitlines():
        if line.startswith("## "):
            current_sec = line.replace("## ", "").strip()
            section_map[current_sec] = ""
        elif current_sec:
            section_map[current_sec] += line + "\n"

    evidence_text = section_map.get("Evidence & Analysis") or report.get("evidence_and_analysis") or ""
    if evidence_text.strip():
        story.append(Paragraph("3. Detailed Evidence & Empirical Analysis", h1_style))
        story.append(_hr())
        for p in evidence_text.split("\n\n"):
            p_clean = _strip_markdown(p.strip())
            if p_clean:
                story.append(Paragraph(_safe_xml(p_clean), body_style))
        story.append(Spacer(1, 0.3 * cm))

    # ── 6. Conflicting Evidence & Contradictions ───────────────────────────
    conflict_text = section_map.get("Conflicting Evidence & Points of Contention") or report.get("conflicting_evidence") or ""
    if conflict_text.strip() or conflicts_count > 0:
        story.append(Paragraph("4. Conflicting Evidence & Methodological Disagreements", h1_style))
        story.append(_hr())

        if claims:
            conflicted_claims = [c for c in claims if c.get("status") == "CONTRADICTED" or len(c.get("contradicting_sources", [])) > 0]
            if conflicted_claims:
                for cc in conflicted_claims:
                    sup_count = len(cc.get("supporting_sources", []))
                    con_count = len(cc.get("contradicting_sources", []))
                    claim_rows = [
                        [
                            Paragraph(f"<b>Contested Claim:</b> {_safe_xml(cc.get('claim', ''))}", ParagraphStyle("CCTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=RED_TEXT)),
                            Paragraph(f"{sup_count} PRO vs {con_count} CON", ParagraphStyle("CCCount", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=WARM_AMBER, alignment=TA_RIGHT))
                        ],
                        [
                            Paragraph(f"<b>Analysis:</b> {_safe_xml(cc.get('analysis', 'Perspectives diverge significantly across consulted sources.'))}", ParagraphStyle("CCBody", parent=styles["Normal"], fontName="Helvetica", fontSize=9, leading=13, textColor=GREY_TEXT)),
                            Paragraph("", styles["Normal"])
                        ]
                    ]
                    ct = Table(claim_rows, colWidths=[usable_width - 3.0 * cm, 3.0 * cm])
                    ct.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("LINEBEFORE", (0, 0), (0, -1), 2.5, DANGER_RED),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                        ("SPAN", (0, 1), (1, 1)),
                    ]))
                    story.append(ct)
                    story.append(Spacer(1, 0.15 * cm))

        if conflict_text.strip():
            for p in conflict_text.split("\n\n"):
                p_clean = _strip_markdown(p.strip())
                if p_clean and not p_clean.startswith("The primary verified"):
                    story.append(Paragraph(_safe_xml(p_clean), body_style))
        story.append(Spacer(1, 0.3 * cm))

    # ── 7. Source Quality & Assessment ──────────────────────────────────────
    source_analysis_text = section_map.get("Source Reliability Assessment") or report.get("source_reliability_analysis") or ""
    story.append(Paragraph("5. Source Quality & Reliability Assessment", h1_style))
    story.append(_hr())
    if source_analysis_text.strip():
        for p in source_analysis_text.split("\n\n"):
            p_clean = _strip_markdown(p.strip())
            if p_clean:
                story.append(Paragraph(_safe_xml(p_clean), body_style))

    # ── 8. Research Limitations ─────────────────────────────────────────────
    limitations_text = section_map.get("Research Limitations") or report.get("limitations") or ""
    if limitations_text.strip():
        story.append(Paragraph("6. Research Scope & Limitations", h1_style))
        story.append(_hr())
        for p in limitations_text.split("\n\n"):
            p_clean = _strip_markdown(p.strip())
            if p_clean:
                story.append(Paragraph(_safe_xml(p_clean), body_style))
        story.append(Spacer(1, 0.3 * cm))

    # ── 9. Conclusion ───────────────────────────────────────────────────────
    conclusion_text = section_map.get("Conclusion") or report.get("conclusion") or ""
    if conclusion_text.strip():
        story.append(Paragraph("7. Conclusion & Strategic Takeaways", h1_style))
        story.append(_hr())
        for p in conclusion_text.split("\n\n"):
            p_clean = _strip_markdown(p.strip())
            if p_clean:
                story.append(Paragraph(_safe_xml(p_clean), body_style))
        story.append(Spacer(1, 0.3 * cm))

    # ── 10. Complete Bibliography & Primary Sources ────────────────────────
    if sources:
        story.append(PageBreak())
        story.append(Paragraph("8. Primary Sources & Evidence Bibliography", h1_style))
        story.append(Paragraph("Complete record of web and document sources crawled, evaluated, and cited.", subtitle_style))
        story.append(_hr(ACCENT))

        for idx, src in enumerate(sources, 1):
            src_title = src.get("title", "Untitled Source")
            url = src.get("url", "")
            domain = src.get("domain", "")
            stype = src.get("source_type", "Web")
            rel_pct = int(src.get("reliability", 0.5) * 100)

            line = f"<b>[{idx}]</b> <b>{_safe_xml(src_title)}</b> &mdash; <i>{_safe_xml(domain)}</i> &bull; Type: <code>{_safe_xml(stype)}</code> &bull; Quality: <b>{rel_pct}%</b>"
            if url:
                line += f'<br/>&nbsp;&nbsp;&nbsp;&nbsp;<a href="{_safe_xml(url)}" color="#1e40af">{_safe_xml(url)}</a>'

            try:
                story.append(Paragraph(line, ref_style))
            except Exception:
                story.append(Paragraph(f"[{idx}] {src_title} - {url}", ref_style))

    # ── Build PDF ───────────────────────────────────────────────────────────
    doc_obj.build(
        story,
        onFirstPage=_session_header_footer,
        onLaterPages=_session_header_footer,
    )
    return buf.getvalue()


def export_session_report_markdown(
    report: Dict[str, Any],
    session: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
    claims: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    """Return the complete research report formatted as Markdown bytes."""
    full_md = report.get("full_markdown")
    if full_md and len(full_md.strip()) > 50:
        return full_md.encode("utf-8")

    title = report.get("title") or (f"Research Report: {session.get('query')}" if session else "Research Report")
    parts = [f"# {title}\n"]
    if report.get("executive_summary"):
        parts.append(f"## Executive Summary\n{report['executive_summary']}\n")
    if report.get("evidence_and_analysis"):
        parts.append(f"## Evidence & Analysis\n{report['evidence_and_analysis']}\n")
    if report.get("conflicting_evidence"):
        parts.append(f"## Conflicting Evidence\n{report['conflicting_evidence']}\n")
    if report.get("limitations"):
        parts.append(f"## Limitations\n{report['limitations']}\n")
    if report.get("conclusion"):
        parts.append(f"## Conclusion\n{report['conclusion']}\n")

    if sources:
        parts.append("## Sources & Citations\n")
        for idx, s in enumerate(sources, 1):
            parts.append(f"{idx}. [{s.get('title')}]({s.get('url')}) — *{s.get('domain')}* (Quality: {int(s.get('reliability', 0.5)*100)}%)")

    return "\n\n".join(parts).encode("utf-8")

