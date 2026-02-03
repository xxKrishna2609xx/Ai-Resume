import io
import re
from pdfminer.high_level import extract_text

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes the raw bytes of a PDF file and returns clean, extracted text.
    Handles both text-based and image-based (scanned) PDFs using OCR.
    """
    try:
        # 1. Try extracting text using pdfminer.six (for text-based PDFs)
        print("🔍 Attempting text extraction with pdfminer...")
        raw_text = extract_text(io.BytesIO(file_bytes))
        
        # 2. Check if we got meaningful text
        if raw_text and raw_text.strip() and len(raw_text.strip()) > 50:
            clean_text = clean_text_data(raw_text)
            print(f"✅ Successfully extracted {len(clean_text)} characters from PDF")
            return clean_text
        
        # 3. If no text found, try OCR for image-based PDFs
        print("⚠️ No text found with pdfminer. Attempting OCR for image-based PDF...")
        return extract_text_with_ocr(file_bytes)
        
    except Exception as e:
        print(f"❌ Error parsing PDF: {e}")
        import traceback
        traceback.print_exc()
        return ""

def extract_text_with_ocr(file_bytes: bytes) -> str:
    """
    Extract text from image-based PDFs using OCR (Optical Character Recognition).
    """
    try:
        from pdf2image import convert_from_bytes
        import pytesseract
        import os
        
        # Set Tesseract path for Windows
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        # Set Poppler path (bundled with project)
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        poppler_path = os.path.join(backend_dir, "poppler", "poppler-24.08.0", "Library", "bin")
        
        print("📄 Converting PDF to images...")
        # Convert PDF to images
        images = convert_from_bytes(file_bytes, poppler_path=poppler_path)
        
        print(f"🖼️ Processing {len(images)} page(s) with OCR...")
        all_text = []
        
        for i, image in enumerate(images):
            print(f"   Processing page {i+1}/{len(images)}...")
            text = pytesseract.image_to_string(image)
            all_text.append(text)
        
        combined_text = "\n".join(all_text)
        clean_text = clean_text_data(combined_text)
        
        print(f"✅ OCR extracted {len(clean_text)} characters from {len(images)} page(s)")
        return clean_text
        
    except ImportError as e:
        print(f"❌ OCR libraries not installed: {e}")
        print("💡 Install with: pip install pytesseract pdf2image pillow")
        print("💡 Also install Tesseract-OCR: https://github.com/UB-Mannheim/tesseract/wiki")
        return "ERROR: OCR not available. Please install pytesseract and pdf2image."
    except Exception as e:
        print(f"❌ OCR failed: {e}")
        import traceback
        traceback.print_exc()
        return ""

def clean_text_data(text: str) -> str:
    """
    Removes clutter like extra whitespace, special characters, 
    and weird PDF formatting artifacts.
    """
    # Replace multiple spaces/tabs with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-printable characters (optional, but good for safety)
    text = ''.join(char for char in text if char.isprintable())
    
    return text.strip()

# --- FOR TESTING ONLY ---
if __name__ == "__main__":
    # You can run this file directly to test it: python pdf_parser.py
    with open("sample_resume.pdf", "rb") as f:
        print(extract_text_from_pdf(f.read())[:500]) # Print first 500 chars