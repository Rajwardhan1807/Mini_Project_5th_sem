import pytest
from backend.tools.paper_export import export_session_report_pdf, export_session_report_markdown

def test_session_report_pdf_generation():
    mock_report = {
        "id": "rep_test1",
        "title": "Research Report: The Future of Quantum Computing",
        "executive_summary": "Quantum computing holds disruptive potential for cryptography, materials science, and optimization problems.",
        "key_findings": [
            {
                "finding": "Fault-tolerant qubits remain the primary engineering bottleneck.",
                "confidence": 88.5,
                "evidence_sources_count": 3,
                "summary": "Multiple academic benchmarks identify quantum error correction as critical."
            },
            {
                "finding": "Commercial quantum advantage has been claimed in sampling problems.",
                "confidence": 72.0,
                "evidence_sources_count": 2,
                "summary": "Recent superconducting experiments demonstrate advantage in non-practical benchmarks."
            }
        ],
        "evidence_and_analysis": "Primary evidence suggests rapid scaling in qubit count accompanied by improved coherence times.",
        "conflicting_evidence": "Contention exists regarding whether classical tensor network simulations can reproduce quantum outputs.",
        "source_reliability_analysis": "All consulted sources derive from peer-reviewed journals and academic preprints.",
        "limitations": "Review is restricted to superconducting and trapped-ion architectures.",
        "conclusion": "Quantum computing is entering the early fault-tolerant era.",
        "full_markdown": "# The Future of Quantum Computing\n\n## Executive Summary\nExecutive summary text here.\n\n## Evidence & Analysis\nAnalysis content.\n\n## Conclusion\nConclusion content.\n",
        "created_at": "2026-11-05"
    }

    mock_session = {
        "id": "research_test_123",
        "query": "The Future of Quantum Computing",
        "mode": "deep",
        "confidence": 80.2,
        "statistics": {
            "sources_discovered": 10,
            "sources_relevant": 5,
            "claims_identified": 4,
            "claims_verified": 3,
            "conflicts_detected": 1,
            "overall_confidence": 80.2
        }
    }

    mock_sources = [
        {
            "id": "src_1",
            "title": "Progress in Quantum Error Correction",
            "url": "https://example.com/qec-progress",
            "domain": "nature.com",
            "source_type": "Academic",
            "reliability": 0.95,
            "snippet": "Surface codes provide threshold error suppression."
        },
        {
            "id": "src_2",
            "title": "Commercial Quantum Readiness Index",
            "url": "https://example.com/quantum-readiness",
            "domain": "ieee.org",
            "source_type": "Research Paper",
            "reliability": 0.90,
            "snippet": "Enterprise adoption is expected by 2030."
        }
    ]

    mock_claims = [
        {
            "claim": "Fault-tolerant qubits remain the primary engineering bottleneck.",
            "status": "VERIFIED",
            "confidence": 88.5,
            "analysis": "Corroborated by academic literature.",
            "supporting_sources": [mock_sources[0]],
            "contradicting_sources": []
        },
        {
            "claim": "Commercial quantum advantage is already commercially viable.",
            "status": "CONTRADICTED",
            "confidence": 42.0,
            "analysis": "Contested by benchmarking studies.",
            "supporting_sources": [],
            "contradicting_sources": [mock_sources[1]]
        }
    ]

    # Test PDF generation
    pdf_bytes = export_session_report_pdf(
        mock_report,
        session=mock_session,
        sources=mock_sources,
        claims=mock_claims
    )
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF")

    # Test Markdown generation
    md_bytes = export_session_report_markdown(
        mock_report,
        session=mock_session,
        sources=mock_sources,
        claims=mock_claims
    )
    assert isinstance(md_bytes, bytes)
    assert len(md_bytes) > 100
    assert b"Executive Summary" in md_bytes

