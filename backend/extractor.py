import os
import json
import PyPDF2
import requests
from dotenv import load_dotenv

load_dotenv()

def configure_gemini(api_key=None):
    # Dummy function for compatibility with app.py since we moved to REST API
    pass

def extract_text_from_pdf(pdf_file):
    """Extracts text from a given PDF file object."""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def parse_resume(pdf_file, api_key=None):
    """Parses resume text and returns structured data using Gemini REST API."""
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    text = extract_text_from_pdf(pdf_file)
    
    prompt = f"""
    You are an expert HR assistant. I will provide you with the text extracted from a resume.
    Your task is to extract the candidate's core skills, total years of experience, and their likely desired job titles.
    Return the result strictly as a valid JSON object with the following keys:
    - "skills": a list of strings representing the skills.
    - "experience_years": an integer representing the total years of relevant experience.
    - "desired_roles": a list of strings representing the job titles they are suited for.
    
    Do not include any markdown formatting like ```json. Just return the raw JSON text.
    
    Resume Text:
    {text}
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={gemini_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result_json = response.json()
        
        response_text = result_json['candidates'][0]['content']['parts'][0]['text'].strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        parsed_data = json.loads(response_text.strip())
        return parsed_data
    except Exception as e:
        print(f"Error parsing JSON from Gemini: {e}")
        return {"skills": [], "experience_years": 0, "desired_roles": []}
