import io
import os
import re
import traceback
from pdfminer.high_level import extract_text

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes the raw bytes of a PDF file and returns clean, extracted text.
    Handles both text-based and image-based (scanned) PDFs using OCR.
    """
    try:
        # 1. Try extracting text using pdfminer.six (for text-based PDFs)
        print("[PDF] Attempting text extraction with pdfminer...")
        raw_text = extract_text(io.BytesIO(file_bytes))
        
        # 2. Check if we got meaningful text
        if raw_text and raw_text.strip() and len(raw_text.strip()) > 50:
            clean_text = clean_text_data(raw_text)
            print(f"[PDF] Successfully extracted {len(clean_text)} characters from PDF")
            return clean_text
        
        # 3. If no text found, try OCR for image-based PDFs
        print("[PDF Warning] No text found with pdfminer. Attempting OCR for image-based PDF...")
        return extract_text_with_ocr(file_bytes)
        
    except Exception as e:
        print(f"[PDF Error] Error parsing PDF: {e}")
        traceback.print_exc()
        return ""

def extract_text_with_ocr(file_bytes: bytes) -> str:
    """
    Extract text from image-based PDFs using OCR (Optical Character Recognition).
    Configure TESSERACT_CMD and POPPLER_PATH in your .env to override binary locations.
    """
    try:
        # pdf2image and pytesseract are optional heavy deps — imported lazily so the
        # app still starts even if they are not installed (OCR is only used as a fallback).
        from pdf2image import convert_from_bytes
        import pytesseract
        
        # Read Tesseract path from env; fall back to the standard Windows install location
        tesseract_cmd = os.getenv(
            "TESSERACT_CMD",
            "tesseract"  # Linux/Render: on PATH. Windows: override via TESSERACT_CMD env var.
        )
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        
        # Read Poppler path from env.
        # If blank/unset on Linux/Render: pass None so pdf2image uses system PATH.
        # On Windows: set POPPLER_PATH to your bundled poppler bin folder.
        poppler_path_env = os.getenv("POPPLER_PATH", "").strip()
        poppler_path = poppler_path_env if poppler_path_env else None
        
        print("[PDF OCR] Converting PDF to images...")
        # Convert PDF to images
        images = convert_from_bytes(file_bytes, poppler_path=poppler_path)
        
        print(f"[PDF OCR] Processing {len(images)} page(s) with OCR...")
        all_text = []
        
        for i, image in enumerate(images):
            print(f"   Processing page {i+1}/{len(images)}...")
            text = pytesseract.image_to_string(image)
            all_text.append(text)
        
        combined_text = "\n".join(all_text)
        clean_text = clean_text_data(combined_text)
        
        print(f"[PDF OCR] OCR extracted {len(clean_text)} characters from {len(images)} page(s)")
        return clean_text
        
    except ImportError as e:
        print(f"[PDF OCR Error] OCR libraries not installed: {e}")
        print("[Tip] Install with: pip install pytesseract pdf2image pillow")
        print("[Tip] Also install Tesseract-OCR: https://github.com/UB-Mannheim/tesseract/wiki")
        return "ERROR: OCR not available. Please install pytesseract and pdf2image."
    except Exception as e:
        print(f"[PDF OCR Error] OCR failed: {e}")
        traceback.print_exc()
        return ""

def clean_text_data(text: str) -> str:
    """
    Removes clutter like extra whitespace and PDF formatting artifacts,
    while PRESERVING newlines so the document structure (sections, headers,
    bullet points) remains readable for the AI and fallback parsers.
    """
    # Collapse multiple spaces/tabs on a single line into one space (do NOT touch newlines)
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Collapse 3+ consecutive blank lines into a maximum of 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove non-printable characters, but explicitly keep newlines and carriage returns
    text = ''.join(
        char for char in text
        if char.isprintable() or char in ('\n', '\r')
    )
    
    return text.strip()

# --- FOR TESTING ONLY ---
if __name__ == "__main__":
    # You can run this file directly to test it: python pdf_parser.py
    with open("sample_resume.pdf", "rb") as f:
        print(extract_text_from_pdf(f.read())[:500]) # Print first 500 chars