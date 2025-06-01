import argparse
import os
import sys
import json
import tempfile
import requests
from dotenv import load_dotenv
from datetime import datetime
from urllib.parse import urlparse

# Optional: for file extraction
try:
    import pdfplumber
    from docx import Document
except ImportError:
    pdfplumber = None
    Document = None

def download_to_tempfile(url: str) -> str:
    """Download a file from URL to a temp file and return the path."""
    local_filename = os.path.join(tempfile.gettempdir(), os.path.basename(urlparse(url).path))
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        return local_filename
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to download file: {str(e)}", file=sys.stderr)
        sys.exit(1)

def extract_resume_text(file_path: str) -> str:
    """Extract text from PDF or DOCX file."""
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == '.pdf':
            if not pdfplumber:
                print("[ERROR] pdfplumber is not installed.", file=sys.stderr)
                sys.exit(1)
            with pdfplumber.open(file_path) as pdf:
                return '\n'.join(page.extract_text() or '' for page in pdf.pages)
        elif ext in ['.doc', '.docx']:
            if not Document:
                print("[ERROR] python-docx is not installed.", file=sys.stderr)
                sys.exit(1)
            doc = Document(file_path)
            return '\n'.join([para.text for para in doc.paragraphs])
        else:
            print(f"[ERROR] Unsupported file type: {ext}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed to extract text: {str(e)}", file=sys.stderr)
        sys.exit(1)

def generate_cover_letter_api(resume_text, job_description, full_name='', email='', address='', phone='', date='', hiring_manager='', hiring_title='', company='', company_address=''):
    load_dotenv()
    try:
        from groq import Groq
    except ImportError:
        raise ImportError("groq package not installed. Please run: pip install groq")
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        raise RuntimeError('GROQ_API_KEY not found in environment.')
    today = date or datetime.now().strftime('%B %d, %Y')
    prompt = f"""
You are a professional career assistant. Write a tailored, compelling cover letter for the following job application. Use the provided resume to highlight the most relevant skills and experience. The cover letter should be professional, concise, and specific to the job description. Address the company and job title if possible.

Applicant Information:
Name: {full_name}
Address: {address}
Phone: {phone}
Email: {email}
Date: {today}

[If available]
Hiring Manager: {hiring_manager}
Hiring Manager Title: {hiring_title}
Company: {company}
Company Address: {company_address}

Resume:
{resume_text}

Job Description:
{job_description}

Cover Letter:
"""
    try:
        client = Groq(api_key=groq_api_key)
        completion = client.chat.completions.create(
            model="gemma2-9b-it",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for job seekers."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7,
        )
        cover_letter = completion.choices[0].message.content.strip()
        return cover_letter
    except Exception as e:
        raise RuntimeError(f"Failed to generate cover letter: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate a cover letter using resume and job description via GROQ API.")
    parser.add_argument('--resume_text', type=str, help='Resume text (if already extracted)')
    parser.add_argument('--resume_file', type=str, help='Path or URL to resume file (PDF, DOCX)')
    parser.add_argument('--job_description', type=str, required=True, help='Job description text')
    parser.add_argument('--full_name', type=str, default='', help='Applicant full name')
    parser.add_argument('--email', type=str, default='', help='Applicant email')
    parser.add_argument('--address', type=str, default='', help='Applicant address')
    parser.add_argument('--phone', type=str, default='', help='Applicant phone number')
    parser.add_argument('--date', type=str, default='', help='Date for the letter')
    parser.add_argument('--hiring_manager', type=str, default='', help='Hiring manager name')
    parser.add_argument('--hiring_title', type=str, default='', help='Hiring manager title')
    parser.add_argument('--company', type=str, default='', help='Company name')
    parser.add_argument('--company_address', type=str, default='', help='Company address')
    args = parser.parse_args()

    load_dotenv()

    resume_text = args.resume_text
    temp_file = None
    if not resume_text and args.resume_file:
        file_path = args.resume_file
        if file_path.startswith('http://') or file_path.startswith('https://'):
            file_path = download_to_tempfile(file_path)
            temp_file = file_path  # Remember to clean up
        resume_text = extract_resume_text(file_path)
    if not resume_text:
        print('[ERROR] No resume text provided or extracted.', file=sys.stderr)
        sys.exit(1)
    try:
        cover_letter = generate_cover_letter_api(
            resume_text=resume_text,
            job_description=args.job_description,
            full_name=args.full_name,
            email=args.email,
            address=args.address,
            phone=args.phone,
            date=args.date,
            hiring_manager=args.hiring_manager,
            hiring_title=args.hiring_title,
            company=args.company,
            company_address=args.company_address
        )
        print(json.dumps({"cover_letter": cover_letter}))
    except Exception as e:
        print(f"[ERROR] Failed to generate cover letter: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

if __name__ == '__main__':
    main() 