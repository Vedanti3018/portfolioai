import argparse
import os
import sys
import json
from dotenv import load_dotenv
from datetime import datetime

# Optional: for file extraction
try:
    import pdfplumber
    from docx import Document
except ImportError:
    pdfplumber = None
    Document = None

try:
    from groq import Groq
except ImportError:
    print("[ERROR] groq package not installed. Please run: pip install groq", file=sys.stderr)
    sys.exit(1)

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    print(f"[DEBUG] File path: {file_path}, Extension: {ext}", file=sys.stderr)
    if ext == '.pdf' and pdfplumber:
        print("[DEBUG] Attempting to open PDF with pdfplumber", file=sys.stderr)
        with pdfplumber.open(file_path) as pdf:
            return '\n'.join(page.extract_text() or '' for page in pdf.pages)
    elif ext in ['.doc', '.docx'] and Document:
        print("[DEBUG] Attempting to open DOCX with python-docx", file=sys.stderr)
        doc = Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    else:
        print(f"[ERROR] Unsupported file type or missing dependencies for: {file_path}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate a cover letter using resume and job description via GROQ API.")
    parser.add_argument('--resume_text', type=str, help='Resume text (if already extracted)')
    parser.add_argument('--resume_file', type=str, help='Path to resume file (PDF, DOCX)')
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

    # Load .env
    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        print('[ERROR] GROQ_API_KEY not found in environment.', file=sys.stderr)
        sys.exit(1)

    # Get resume text
    resume_text = args.resume_text
    if not resume_text and args.resume_file:
        resume_text = extract_text_from_file(args.resume_file)
    if not resume_text:
        print('[ERROR] No resume text provided or extracted.', file=sys.stderr)
        sys.exit(1)

    # Compose prompt
    today = args.date or datetime.now().strftime('%B %d, %Y')
    prompt = f"""
You are a professional career assistant. Write a tailored, compelling cover letter for the following job application. Use the provided resume to highlight the most relevant skills and experience. The cover letter should be professional, concise, and specific to the job description. Address the company and job title if possible.

Applicant Information:
Name: {args.full_name}
Address: {args.address}
Phone: {args.phone}
Email: {args.email}
Date: {today}

[If available]
Hiring Manager: {args.hiring_manager}
Hiring Manager Title: {args.hiring_title}
Company: {args.company}
Company Address: {args.company_address}

Resume:
{resume_text}

Job Description:
{args.job_description}

Cover Letter:
"""

    # Call GROQ API using the SDK
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
        print(json.dumps({"cover_letter": cover_letter}))
    except Exception as e:
        print(f"[ERROR] Failed to generate cover letter: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 