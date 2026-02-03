import os
import google.generativeai as genai
from typing import Dict, Any
import json
import re

def analyze_resume_with_gemini(text: str) -> Dict[str, Any]:
    """
    Analyzes resume text using Google's Gemini AI and returns structured data.
    """
    try:
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not found in environment variables"}

        # Configure Gemini
        genai.configure(api_key=api_key)

        # Try to find a working model
        model = None
        model_name = None
        
        # First, list all available models
        print("📋 Checking available Gemini models...")
        try:
            available_models = list(genai.list_models())
            for m in available_models:
                if 'generateContent' in m.supported_generation_methods:
                    print(f"   ✅ Found: {m.name}")
                    model_name = m.name
                    model = genai.GenerativeModel(model_name)
                    print(f"🎯 Using model: {model_name}")
                    break
        except Exception as e:
            print(f"⚠️ Error listing models: {e}")
        
        # Fallback to hardcoded model names if listing fails
        if not model:
            print("⚠️ Trying fallback model names...")
            model_names = ['gemini-pro', 'gemini-1.5-flash', 'models/gemini-pro']
            for name in model_names:
                try:
                    print(f"   Trying: {name}")
                    model = genai.GenerativeModel(name)
                    model_name = name
                    print(f"   ✅ Success with {name}")
                    break
                except Exception as e:
                    print(f"   ❌ Failed: {e}")
                    continue
        
        if not model:
            return {"error": "Could not find a working Gemini model"}

        # Create the prompt for resume analysis
        prompt = f"""
        Analyze the following resume text and extract key information in JSON format:

        Resume Text:
        {text}

        Please provide a JSON response with the following fields:
        - candidate_name: The full name of the candidate
        - skills: Array of technical skills mentioned
        - experience_years: Number of years of experience (estimate if not explicit)
        - resume_quality_score: Score from 1-10 based on completeness and professionalism
        - summary: Brief 2-3 sentence summary of the candidate's background

        Return ONLY valid JSON, no additional text or markdown formatting.
        """

        # Generate response
        print(f"🤖 Generating content with {model_name}...")
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        print(f"✅ Got response: {result_text[:200]}...")

        # Try to parse JSON from response
        try:
            # Remove markdown code blocks if present
            cleaned_text = re.sub(r'```json\s*|\s*```', '', result_text)
            cleaned_text = cleaned_text.strip()
            
            # Try to find JSON object in the response
            json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
            if json_match:
                cleaned_text = json_match.group(0)
            
            # Fix common JSON issues
            # Remove trailing commas before closing brackets/braces
            cleaned_text = re.sub(r',(\s*[}\]])', r'\1', cleaned_text)
            
            # Parse the JSON
            ai_result = json.loads(cleaned_text)
            
            print(f"✅ Successfully parsed JSON response")
            
            return ai_result
            
        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse JSON from Gemini response: {e}")
            print(f"🔍 Cleaned text: {cleaned_text[:500]}...")
            
            # Try to extract fields manually as fallback
            candidate_name = "Unknown"
            skills = []
            experience = 0
            
            # Extract candidate name
            name_match = re.search(r'"candidate_name"\s*:\s*"([^"]+)"', result_text)
            if name_match:
                candidate_name = name_match.group(1)
            
            # Extract skills array
            skills_match = re.search(r'"skills"\s*:\s*\[(.*?)\]', result_text, re.DOTALL)
            if skills_match:
                skills_text = skills_match.group(1)
                skills = [s.strip(' "\n,') for s in re.findall(r'"([^"]+)"', skills_text)]
            
            # Extract experience
            exp_match = re.search(r'"experience_years"\s*:\s*(\d+)', result_text)
            if exp_match:
                experience = int(exp_match.group(1))
            
            print(f"📝 Extracted via regex - Name: {candidate_name}, Skills: {len(skills)}, Exp: {experience}")
            
            # Return a structured fallback with extracted data
            return {
                "candidate_name": candidate_name,
                "skills": skills,
                "experience_years": experience,
                "resume_quality_score": 5,
                "summary": "Analysis complete (parsed with fallback method)",
                "raw_response": result_text[:1000],
                "parse_note": "Used regex extraction due to JSON format issues"
            }

    except Exception as e:
        print(f"❌ AI Analysis Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"AI Analysis failed: {str(e)}"}
    