import json
import os
import re
import google.generativeai as genai
import fire
from dotenv import load_dotenv
from pprint import pprint

# Load environment variables from .env file
load_dotenv()

def configure_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No Gemini API key found in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-pro-exp-03-25')

def grade_problem(problem_data, model=None):
    if model is None:
        model = configure_gemini()
    
    problem = problem_data.get("problem", "")
    student_answer = problem_data.get("student_answer", "")
    answer_key = problem_data.get("answer_key", "")
    
    prompt = f"""
    PROBLEM:
    {problem}
    
    STUDENT ANSWER:
    {student_answer}
    
    CORRECT ANSWER:
    {answer_key}
    
    Grade the student's answer with:
    1. A percentage score (0-100%)
    2. Brief feedback ONLY if points were deducted
    
    Format your response as JSON:
    {{
      "percentage": number,
      "feedback": "brief explanation if points deducted, otherwise empty string"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        content = response.text
        
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            json_str = json_match.group(1)
            result = json.loads(json_str)
            return result.get("percentage", 0), result.get("feedback", "")
        else:
            return 0, "Error: Could not parse grading response"
            
    except Exception as e:
        return 0, f"Error grading problem: {str(e)}"

def grade_assessment_data(assessment_data, save_output=False, output_file="graded_assessment.json"):
    model = configure_gemini()
    
    problems = assessment_data.get("problems", {})
    total_problems = len(problems)
    
    print(f"Grading {total_problems} problems...")
    
    total_score = 0
    
    for i, (problem_id, problem_data) in enumerate(problems.items()):
        print(f"Grading problem {problem_id} ({i+1}/{total_problems})...")
        
        percentage, feedback = grade_problem(problem_data, model)
        
        problem_data["grade_percentage"] = percentage
        problem_data["feedback"] = feedback
        
        total_score += percentage
    
    if total_problems > 0:
        assessment_data["overall_score"] = total_score / total_problems
    else:
        assessment_data["overall_score"] = 0
    
    if save_output:
        with open(output_file, 'w') as f:
            json.dump(assessment_data, f, indent=2)
        print(f"Results saved to {output_file}")
        
        # Print formatted JSON to the console
        print("\nGraded Assessment Results:")
        print(json.dumps(assessment_data, indent=4, sort_keys=True))
    
    print(f"Grading complete! Overall score: {assessment_data['overall_score']:.2f}%")
    
    return assessment_data

def grade_assessment_file(assessment_file, output_file="graded_assessment.json"):
    with open(assessment_file, 'r') as f:
        assessment_data = json.load(f)
    
    return grade_assessment_data(assessment_data, True, output_file)

def grade_pdf(pdf_path, answer_key_path, save_intermediate=False, output_file="graded_assessment.json"):
    from assessment_parser import parse_pdf_to_assessment
    
    print(f"Processing PDF assessment: {pdf_path}")
    print(f"Using answer key: {answer_key_path}")
    
    assessment_data = parse_pdf_to_assessment(
        pdf_path, 
        answer_key_path, 
        save_intermediate
    )
    
    if assessment_data:
        output = output_file if save_intermediate else None
        return grade_assessment_data(
            assessment_data, 
            save_intermediate, 
            output
        )
    else:
        print("Error: Failed to parse assessment from PDF")
        return None

def check_environment():
    required_keys = {
        "OPENAI_API_KEY": "for GPT-4o OCR",
        "ANTHROPIC_API_KEY": "for Claude assessment parsing",
        "GEMINI_API_KEY": "for Gemini grading"
    }
    
    missing_keys = []
    for key, purpose in required_keys.items():
        if not os.environ.get(key):
            missing_keys.append(f"{key} {purpose}")
    
    if missing_keys:
        print("Error: Missing required API keys:")
        for key in missing_keys:
            print(f"  - {key}")
        print("\nPlease add these API keys to your .env file.")
        print("You can copy .env.example to .env and fill in your API keys.")
        return False
    
    return True

def process_pdf_assessment(pdf_path, answer_key_path, save_intermediate=False, output_file="graded_assessment.json"):
    """
    Complete end-to-end pipeline: PDF → Text → Assessment Analysis → Grading
    
    Args:
        pdf_path: Path to the PDF assessment file
        answer_key_path: Path to the answer key text file
        save_intermediate: Whether to save intermediate results to files
        output_file: Where to save the final graded assessment JSON
        
    Returns:
        dict: Graded assessment results
    """
    if not check_environment():
        return None
        
    return grade_pdf(pdf_path, answer_key_path, save_intermediate, output_file)

if __name__ == "__main__":
    fire.Fire({
        "grade_file": grade_assessment_file,
        "grade_pdf": grade_pdf,
        "process": process_pdf_assessment
    })