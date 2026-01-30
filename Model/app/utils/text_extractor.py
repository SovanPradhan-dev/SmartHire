def extract_text(file):
    """
    Safely read PDF, DOCX, or TXT
    """
    filename = file.filename.lower()
    try:
        if filename.endswith(".pdf"):
            import pdfplumber
            text = ""
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text or ""

        elif filename.endswith(".docx"):
            from docx import Document
            doc = Document(file)
            return "\n".join([p.text for p in doc.paragraphs]) or ""

        else:
            return file.read().decode("utf-8", errors="ignore")
    except Exception as e:
        # Fail gracefully
        print(f"Error reading file {filename}: {e}")
        return ""
