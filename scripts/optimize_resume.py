import os
import json
import groq
from typing import Dict, Any

# Initialize Groq client
client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))

def optimize_resume_content(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Optimize resume content using Groq API for ATS compatibility.
    """
    # Prepare the prompt for optimization
    prompt = f"""
    Optimize the following resume content for ATS (Applicant Tracking System) compatibility.
    Focus on:
    1. Using industry-standard keywords
    2. Clear and concise descriptions
    3. Quantifiable achievements
    4. Proper formatting and structure
    
    Resume Content:
    {json.dumps(resume_data, indent=2)}
    
    Provide the optimized content in the same JSON structure, with improvements in:
    - Job descriptions
    - Skills section
    - Achievements
    - Professional summary
    """

    try:
        # Call Groq API
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",  # Using Mixtral for better performance
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume writer and ATS optimization specialist."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4000,
        )

        # Parse the response
        optimized_content = json.loads(completion.choices[0].message.content)
        return optimized_content

    except Exception as e:
        print(f"Error optimizing resume: {str(e)}")
        return resume_data

def generate_ats_score(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an ATS compatibility score and suggestions using Groq API.
    """
    prompt = f"""
    Analyze the following resume content and provide:
    1. An ATS compatibility score (0-100)
    2. Key strengths
    3. Areas for improvement
    4. Specific suggestions for optimization
    
    Resume Content:
    {json.dumps(resume_data, indent=2)}
    
    Provide the analysis in JSON format with the following structure:
    {{
        "score": number,
        "strengths": [string],
        "improvements": [string],
        "suggestions": [string]
    }}
    """

    try:
        # Call Groq API
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert ATS system analyst and resume optimization specialist."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        # Parse the response
        analysis = json.loads(completion.choices[0].message.content)
        return analysis

    except Exception as e:
        print(f"Error generating ATS score: {str(e)}")
        return {
            "score": 0,
            "strengths": [],
            "improvements": ["Error analyzing resume"],
            "suggestions": ["Please try again later"]
        }

def suggest_keywords(job_title: str, industry: str) -> Dict[str, Any]:
    """
    Suggest relevant keywords for a specific job title and industry using Groq API.
    """
    prompt = f"""
    Suggest relevant keywords and skills for a {job_title} position in the {industry} industry.
    Focus on:
    1. Technical skills
    2. Soft skills
    3. Industry-specific terminology
    4. Certifications
    5. Tools and technologies
    
    Provide the suggestions in JSON format with the following structure:
    {{
        "technical_skills": [string],
        "soft_skills": [string],
        "keywords": [string],
        "certifications": [string],
        "tools": [string]
    }}
    """

    try:
        # Call Groq API
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in job market analysis and ATS optimization."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        # Parse the response
        suggestions = json.loads(completion.choices[0].message.content)
        return suggestions

    except Exception as e:
        print(f"Error suggesting keywords: {str(e)}")
        return {
            "technical_skills": [],
            "soft_skills": [],
            "keywords": [],
            "certifications": [],
            "tools": []
        }

if __name__ == "__main__":
    # Example usage
    sample_resume = {
        "personal_info": {
            "name": "John Doe",
            "title": "Software Engineer",
            "summary": "Experienced software engineer with 5 years of experience"
        },
        "experience": [
            {
                "title": "Senior Developer",
                "company": "Tech Corp",
                "description": "Led development of web applications"
            }
        ],
        "skills": ["JavaScript", "React", "Node.js"]
    }

    # Test the functions
    optimized = optimize_resume_content(sample_resume)
    print("Optimized Resume:", json.dumps(optimized, indent=2))

    score = generate_ats_score(sample_resume)
    print("ATS Score:", json.dumps(score, indent=2))

    keywords = suggest_keywords("Software Engineer", "Technology")
    print("Suggested Keywords:", json.dumps(keywords, indent=2)) 