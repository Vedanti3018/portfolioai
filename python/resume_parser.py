#!/usr/bin/env python3
"""
Resume Parser for PortfolioAI

This script parses resume/CV documents (PDF and DOCX) and extracts structured information
including personal details, work experience, education, and skills.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import re
from datetime import datetime

# For PDF parsing
try:
    import pdfplumber
except ImportError:
    print("Please install pdfplumber: pip install pdfplumber")
    sys.exit(1)

# For DOCX parsing
try:
    import docx
except ImportError:
    print("Please install python-docx: pip install python-docx")
    sys.exit(1)

# For NLP tasks
try:
    import spacy
    from spacy.matcher import Matcher
except ImportError:
    print("Please install spacy: pip install spacy")
    print("Then download the model: python -m spacy download en_core_web_sm")
    sys.exit(1)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("Please download the spaCy model: python -m spacy download en_core_web_sm")
    sys.exit(1)

class ResumeParser:
    """Parse resume documents and extract structured information."""
    
    def __init__(self):
        self.matcher = Matcher(nlp.vocab)
        self._setup_matchers()
        
    def _setup_matchers(self):
        """Set up pattern matchers for various resume sections."""
        # Email pattern
        email_pattern = [{"LIKE_EMAIL": True}]
        self.matcher.add("EMAIL", [email_pattern])
        
        # Phone pattern - simplified for demonstration
        phone_pattern = [{"SHAPE": {"REGEX": "d{3}[-.]d{3}[-.]d{4}"}}]
        self.matcher.add("PHONE", [phone_pattern])
        
        # Education keywords
        education_pattern = [{"LOWER": {"IN": ["education", "academic", "degree", "university", "college", "school"]}}]
        self.matcher.add("EDUCATION_SECTION", [education_pattern])
        
        # Experience keywords
        experience_pattern = [{"LOWER": {"IN": ["experience", "employment", "work", "professional", "career"]}}]
        self.matcher.add("EXPERIENCE_SECTION", [experience_pattern])
        
        # Skills keywords
        skills_pattern = [{"LOWER": {"IN": ["skills", "technologies", "technical", "competencies", "proficiencies"]}}]
        self.matcher.add("SKILLS_SECTION", [skills_pattern])
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file."""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_text_from_docx(self, docx_path):
        """Extract text from a DOCX file."""
        try:
            doc = docx.Document(docx_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""
    
    def extract_text(self, file_path):
        """Extract text from a file based on its extension."""
        file_path = Path(file_path)
        if file_path.suffix.lower() == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif file_path.suffix.lower() in [".docx", ".doc"]:
            return self.extract_text_from_docx(file_path)
        else:
            print(f"Unsupported file format: {file_path.suffix}")
            return ""
    
    def extract_name(self, text):
        """Extract the name from the resume text."""
        # Simplified approach: assume the name is at the beginning of the resume
        lines = text.strip().split('\n')
        if lines:
            # Get the first non-empty line
            for line in lines:
                if line.strip():
                    # Process with spaCy to identify person names
                    doc = nlp(line.strip())
                    for ent in doc.ents:
                        if ent.label_ == "PERSON":
                            return ent.text
                    # If no entity found, just return the first line
                    return line.strip()
        return ""
    
    def extract_contact_info(self, text):
        """Extract contact information (email, phone) from the resume text."""
        doc = nlp(text)
        email = ""
        phone = ""
        
        # Extract email using regex
        email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_matches = re.findall(email_regex, text)
        if email_matches:
            email = email_matches[0]
        
        # Extract phone using regex (simplified)
        phone_regex = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        phone_matches = re.findall(phone_regex, text)
        if phone_matches:
            phone = phone_matches[0]
        
        return {"email": email, "phone": phone}
    
    def extract_education(self, text):
        """Extract education information from the resume text."""
        education = []
        
        # Simple pattern matching for education entries
        education_regex = r'(?i)(university|college|school|institute).*?(?:of|for)?\s+(.*?)(?:,|\n)'
        degree_regex = r'(?i)(bachelor|master|phd|doctorate|bs|ms|ba|ma|mba).*?(degree|of|in)?\s+(.*?)(?:,|\n)'
        date_regex = r'(?i)(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*(?:-|to|–|until)\s*(present|current|now|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,4}'
        
        # Find institutions
        institutions = re.findall(education_regex, text)
        degrees = re.findall(degree_regex, text)
        dates = re.findall(date_regex, text)
        
        # Combine the information
        for i, inst in enumerate(institutions):
            edu_entry = {
                "institution": inst[1].strip() if len(inst) > 1 else inst[0].strip(),
                "degree": degrees[i][2].strip() if i < len(degrees) and len(degrees[i]) > 2 else "",
                "startDate": "",
                "endDate": ""
            }
            
            if i < len(dates):
                date_parts = dates[i]
                if len(date_parts) >= 2:
                    # Convert month names to numbers
                    start_date = date_parts[0].strip().lower()
                    end_date = date_parts[1].strip().lower()
                    
                    # Extract year and month from start date
                    start_year_match = re.search(r'\d{4}', start_date)
                    if start_year_match:
                        start_year = start_year_match.group(0)
                        month_match = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)', start_date.lower())
                        if month_match:
                            month_name = month_match.group(0)[:3].lower()
                            month_num = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", 
                                        "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"}.get(month_name, "01")
                            edu_entry["startDate"] = f"{start_year}-{month_num}"
                    
                    # Extract year and month from end date
                    if "present" in end_date or "current" in end_date or "now" in end_date:
                        current_date = datetime.now()
                        edu_entry["endDate"] = f"{current_date.year}-{current_date.month:02d}"
                    else:
                        end_year_match = re.search(r'\d{4}', end_date)
                        if end_year_match:
                            end_year = end_year_match.group(0)
                            month_match = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)', end_date.lower())
                            if month_match:
                                month_name = month_match.group(0)[:3].lower()
                                month_num = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", 
                                            "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"}.get(month_name, "01")
                                edu_entry["endDate"] = f"{end_year}-{month_num}"
            
            education.append(edu_entry)
        
        return education
    
    def extract_experience(self, text):
        """Extract work experience information from the resume text."""
        experience = []
        
        # Simple pattern matching for job entries
        job_title_regex = r'(?i)(senior|junior|lead|principal|staff)?\s*(software|frontend|backend|full.?stack|data|product|project|program|web|mobile|cloud|devops|qa|test)?\s*(developer|engineer|architect|manager|analyst|designer|consultant|specialist)'
        company_regex = r'(?i)(?:at|with|for)?\s+(.*?)(?:,|\n)'
        date_regex = r'(?i)(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*(?:-|to|–|until)\s*(present|current|now|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{0,4}'
        
        # Find job titles, companies, and dates
        job_titles = re.findall(job_title_regex, text)
        companies = re.findall(company_regex, text)
        dates = re.findall(date_regex, text)
        
        # Combine the information
        for i, title_parts in enumerate(job_titles):
            title = " ".join([p for p in title_parts if p]).strip()
            
            exp_entry = {
                "title": title,
                "company": companies[i].strip() if i < len(companies) else "",
                "startDate": "",
                "endDate": "",
                "description": ""
            }
            
            if i < len(dates):
                date_parts = dates[i]
                if len(date_parts) >= 2:
                    # Convert month names to numbers
                    start_date = date_parts[0].strip().lower()
                    end_date = date_parts[1].strip().lower()
                    
                    # Extract year and month from start date
                    start_year_match = re.search(r'\d{4}', start_date)
                    if start_year_match:
                        start_year = start_year_match.group(0)
                        month_match = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)', start_date.lower())
                        if month_match:
                            month_name = month_match.group(0)[:3].lower()
                            month_num = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", 
                                        "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"}.get(month_name, "01")
                            exp_entry["startDate"] = f"{start_year}-{month_num}"
                    
                    # Extract year and month from end date
                    if "present" in end_date or "current" in end_date or "now" in end_date:
                        current_date = datetime.now()
                        exp_entry["endDate"] = None  # Indicate current position
                    else:
                        end_year_match = re.search(r'\d{4}', end_date)
                        if end_year_match:
                            end_year = end_year_match.group(0)
                            month_match = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)', end_date.lower())
                            if month_match:
                                month_name = month_match.group(0)[:3].lower()
                                month_num = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", 
                                            "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"}.get(month_name, "01")
                                exp_entry["endDate"] = f"{end_year}-{month_num}"
            
            # Extract description (simplified approach)
            if i < len(job_titles) - 1:
                start_idx = text.find(title)
                end_idx = text.find(" ".join([p for p in job_titles[i+1] if p]).strip())
                if start_idx != -1 and end_idx != -1:
                    description = text[start_idx:end_idx].strip()
                    exp_entry["description"] = description
            
            experience.append(exp_entry)
        
        return experience
    
    def extract_skills(self, text):
        """Extract skills from the resume text."""
        skills = []
        
        # Common technical skills
        tech_skills = [
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", "kotlin",
            "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", "asp.net",
            "html", "css", "sass", "less", "bootstrap", "tailwind", "material-ui",
            "sql", "mysql", "postgresql", "mongodb", "oracle", "sqlite", "nosql",
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd",
            "git", "svn", "github", "gitlab", "bitbucket",
            "agile", "scrum", "kanban", "jira", "confluence",
            "machine learning", "ai", "data science", "tensorflow", "pytorch", "scikit-learn",
            "rest api", "graphql", "microservices", "serverless"
        ]
        
        # Look for skills in the text
        doc = nlp(text.lower())
        for skill in tech_skills:
            if skill in doc.text:
                skills.append(skill)
        
        return skills
    
    def parse_resume(self, file_path):
        """Parse a resume file and extract structured information."""
        text = self.extract_text(file_path)
        if not text:
            return {"error": "Failed to extract text from the file"}
        
        name = self.extract_name(text)
        contact_info = self.extract_contact_info(text)
        education = self.extract_education(text)
        experience = self.extract_experience(text)
        skills = self.extract_skills(text)
        
        return {
            "fullName": name,
            "email": contact_info["email"],
            "phone": contact_info["phone"],
            "education": education,
            "experience": experience,
            "skills": skills
        }

def main():
    parser = argparse.ArgumentParser(description="Parse resume documents")
    parser.add_argument("file_path", help="Path to the resume file (PDF or DOCX)")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    args = parser.parse_args()
    
    resume_parser = ResumeParser()
    result = resume_parser.parse_resume(args.file_path)
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
