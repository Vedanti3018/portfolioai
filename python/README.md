# PortfolioAI Python Scripts

This directory contains Python scripts used by the PortfolioAI application for parsing resumes and LinkedIn profiles.

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Download the spaCy model:

```bash
python -m spacy download en_core_web_sm
```

## Resume Parser

The `resume_parser.py` script extracts structured information from resume/CV documents (PDF and DOCX), including:

- Personal details (name, email, phone)
- Work experience
- Education
- Skills

### Usage

```bash
python resume_parser.py path/to/resume.pdf --output output.json
```

or

```bash
python resume_parser.py path/to/resume.docx --output output.json
```

## LinkedIn Scraper

The `linkedin_scraper.py` script extracts structured information from LinkedIn profiles, including:

- Personal details (name, headline, location, about)
- Work experience
- Education
- Skills

### Usage

```bash
python linkedin_scraper.py https://www.linkedin.com/in/username --email your@email.com --password yourpassword --output output.json
```

For non-headless mode (visible browser):

```bash
python linkedin_scraper.py https://www.linkedin.com/in/username --email your@email.com --password yourpassword --no-headless --output output.json
```

## Integration with PortfolioAI

These scripts are called by the PortfolioAI application's API endpoints:

- `/api/parse-resume`: Calls `resume_parser.py` to extract data from uploaded resumes
- `/api/parse-linkedin`: Calls `linkedin_scraper.py` to extract data from LinkedIn profiles

## Requirements

- Python 3.8+
- Chrome browser (for LinkedIn scraping)
- ChromeDriver (for LinkedIn scraping)

## Notes

- The LinkedIn scraper requires valid LinkedIn credentials to access profiles.
- For production use, consider implementing more robust error handling and rate limiting to avoid being blocked by LinkedIn.
- The resume parser's accuracy depends on the structure and format of the input documents.
