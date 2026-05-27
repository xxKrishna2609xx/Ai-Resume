import os
import re
import json
import traceback
import google.generativeai as genai
from typing import Dict, Any

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

        # Fetch available models that support generateContent (best-effort)
        available_model_names = []
        try:
            available_models = list(genai.list_models())
            available_model_names = [
                m.name for m in available_models
                if 'generateContent' in m.supported_generation_methods
            ]
            print(f"[AI] Available models from API: {available_model_names}")
        except Exception as e:
            print(f"[Warning] Could not list models from API: {e}. Will try preferred models directly.")

        # List of preferred models in order of preference
        # These are tried first against the listed models, then attempted directly as a hard fallback.
        preferred_models = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
        ]

        model = None
        model_name = None

        print("[AI] Resolving Gemini model...")

        # Step 1: Try to find a preferred model in the listed available models
        if available_model_names:
            for name in preferred_models:
                normalized_name = name if name.startswith("models/") else f"models/{name}"
                if normalized_name in available_model_names:
                    model_name = normalized_name
                    model = genai.GenerativeModel(model_name)
                    print(f"   [OK] Using preferred model (from list): {model_name}")
                    break

            # If no preferred model found, use the first available model
            if not model:
                model_name = available_model_names[0]
                model = genai.GenerativeModel(model_name)
                print(f"   [OK] Using first available model (from list): {model_name}")

        # Step 2: Hard fallback — try each preferred model directly if list_models failed or
        # returned no usable results. We attempt to instantiate and call the model; if it
        # throws, we move on to the next one.
        if not model:
            print("[AI] Attempting hard fallback: probing preferred models directly...")
            for name in preferred_models:
                candidate_name = name if name.startswith("models/") else f"models/{name}"
                try:
                    probe = genai.GenerativeModel(candidate_name)
                    # Send a minimal ping to verify the model is accessible
                    probe.generate_content("ping")
                    model = probe
                    model_name = candidate_name
                    print(f"   [OK] Hard fallback succeeded with model: {model_name}")
                    break
                except Exception as probe_err:
                    print(f"   [Skip] Model {candidate_name} not accessible: {probe_err}")

        if not model:
            return {"error": "Could not find a working Gemini model. Check your GEMINI_API_KEY and quota."}

        # Ensure model_name is always a string from this point forward
        model_name = model_name or "unknown"


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
        print(f"[AI] Generating content with {model_name}...")
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        print(f"[AI] Got response: {result_text[:200]}...")

        # Try to parse JSON from response
        # Initialize cleaned_text here so it is always bound, even if an early
        # step inside the try block raises before it gets reassigned.
        cleaned_text = result_text
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
            
            print(f"[AI] Successfully parsed JSON response")
            
            return ai_result
            
        except json.JSONDecodeError as e:
            print(f"[Warning] Failed to parse JSON from Gemini response: {e}")
            print(f"[AI] Cleaned text: {cleaned_text[:500]}...")
            
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
            
            print(f"[AI] Extracted via regex - Name: {candidate_name}, Skills: {len(skills)}, Exp: {experience}")
            
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
        print(f"[Error] AI Analysis Error: {e}")
        traceback.print_exc()
        return {"error": f"AI Analysis failed: {str(e)}"}
    