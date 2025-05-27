import json
import os
import sys
from groq import Groq
from dotenv import load_dotenv

def generate_summary(portfolio_data):
    """Generates a portfolio summary using the Groq API."""
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Construct prompt parts from portfolio data
        prompt_parts = []

        if portfolio_data.get('education'):
            prompt_parts.append("Education:")
            for edu in portfolio_data['education']:
                prompt_parts.append(f"- {edu.get('degree', '')} in {edu.get('field_of_study', '')} from {edu.get('institution', '')} ({edu.get('start_date', '')} - {edu.get('end_date', '')})")
                if edu.get('description'):
                    prompt_parts.append(f"  Description: {edu['description']}")
            prompt_parts.append("")

        if portfolio_data.get('experience'):
            prompt_parts.append("Experience:")
            for exp in portfolio_data['experience']:
                prompt_parts.append(f"- {exp.get('position', '')} at {exp.get('company', '')} ({exp.get('start_date', '')} - {exp.get('end_date', '')})")
                if exp.get('description'):
                    prompt_parts.append(f"  Description: {exp['description']}")
            prompt_parts.append("")

        if portfolio_data.get('projects'):
            prompt_parts.append("Projects:")
            for project in portfolio_data['projects']:
                prompt_parts.append(f"- {project.get('name', '')} ({project.get('start_date', '')} - {project.get('end_date', '')})")
                if project.get('description'):
                    prompt_parts.append(f"  Description: {project['description']}")
                if project.get('url'):
                    prompt_parts.append(f"  URL: {project['url']}")
            prompt_parts.append("")

        if portfolio_data.get('certifications'):
            prompt_parts.append("Certifications:")
            for cert in portfolio_data['certifications']:
                prompt_parts.append(f"- {cert.get('name', '')} from {cert.get('issuer', '')} (Issued: {cert.get('date', '')})")
                if cert.get('url'):
                    prompt_parts.append(f"  URL: {cert.get('url', '')}")
            prompt_parts.append("")

        prompt = "\n".join(prompt_parts).strip()

        if not prompt:
            return "Please add some education, experience, projects, or certifications to generate a summary."

        # Final prompt instruction
        full_prompt = f"""You are an expert portfolio branding assistant.

Write a crisp 2–3 line summary for the top section portfolio website. Do **not** start with "As a..." or "I am a...". Instead, begin with a confident, direct statement.

Capture their role, key skills or technologies, 1–2 standout achievements or domains, and what excites them in their work. Make it informal yet professional. Avoid buzzwords like "team player" or "passionate individual".

Here's the background data:
{prompt}
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You generate crisp, confident portfolio summaries — output only the summary with no preamble or explanation.",
                },
                {
                    "role": "user",
                    "content": full_prompt,
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=250,
        )

        return chat_completion.choices[0].message.content

    except Exception as e:
        print(f"Error generating summary: {e}", file=sys.stderr)
        return f"Error generating summary: {e}"

if __name__ == "__main__":
    try:
        portfolio_data_json = sys.stdin.read()
        portfolio_data = json.loads(portfolio_data_json)
    except json.JSONDecodeError as e:
        print(f"Error reading input JSON: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)

    summary = generate_summary(portfolio_data)

    print(json.dumps({"summary": summary}))
    sys.exit(0)
 