#!/usr/bin/env python3

import argparse
import json
import os
import sys
from pathlib import Path
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader

def load_template(template_id):
    """Load the HTML template and its associated CSS."""
    template_dir = Path(__file__).parent.parent / 'resume-templates'
    template_path = template_dir / f'{template_id}.html'
    css_path = template_dir / f'{template_id}.css'
    base_css_path = template_dir / 'ats-base.css'

    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_id}")

    # Load the template
    env = Environment(loader=FileSystemLoader(str(template_dir)))
    template = env.get_template(f'{template_id}.html')

    # Load CSS files
    css_files = [base_css_path]
    if css_path.exists():
        css_files.append(css_path)

    return template, css_files

def generate_pdf(template_id, data_file, output_file):
    """Generate a PDF from the template and data."""
    try:
        # Load the template and CSS
        template, css_files = load_template(template_id)

        # Load the resume data
        with open(data_file, 'r') as f:
            resume_data = json.load(f)

        # Render the template with the data
        html_content = template.render(**resume_data['content'])

        # Create the HTML document
        html = HTML(string=html_content)

        # Load and apply CSS
        css = []
        for css_file in css_files:
            css.append(CSS(filename=str(css_file)))

        # Generate the PDF
        html.write_pdf(output_file, stylesheets=css)

        print(f"PDF generated successfully: {output_file}")
        return True

    except Exception as e:
        print(f"Error generating PDF: {str(e)}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='Generate a resume PDF from a template and data.')
    parser.add_argument('--template', required=True, help='Template ID')
    parser.add_argument('--data', required=True, help='Path to JSON data file')
    parser.add_argument('--output', required=True, help='Path to output PDF file')
    args = parser.parse_args()

    success = generate_pdf(args.template, args.data, args.output)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main() 