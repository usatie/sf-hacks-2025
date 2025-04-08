import json
import re
import anthropic
import os
import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_anthropic_client():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("No Anthropic API key found in environment variables")
    return anthropic.Anthropic(api_key=api_key)

def get_problem_numbers(questions_text, student_answers_text, answer_key_text, client=None):
    if client is None:
        client = get_anthropic_client()
    
    prompt = f"""
    Extract all problem numbers from these three documents:
    
    QUESTIONS:
    {questions_text}
    
    STUDENT ANSWERS:
    {student_answers_text}
    
    ANSWER KEY:
    {answer_key_text}
    
    Return only a JSON array of the problem numbers as strings. Example: ["1.1", "1.2", "2.1", "2.2"]
    """
    
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=1000,
            temperature=0,
            system="You extract problem numbers from educational content. Return only a JSON array of problem numbers.",
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        )
        
        content = response.content[0].text
        json_match = re.search(r'(\[.*\])', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            problem_numbers = json.loads(json_str)
            return sorted(problem_numbers)
        else:
            raise ValueError("Could not extract problem numbers from Claude's response")
            
    except Exception as e:
        print(f"Error extracting problem numbers: {e}")
        return []

def generate_problem_json(problem_number, questions_text, student_answers_text, answer_key_text, client=None):
    if client is None:
        client = get_anthropic_client()
    
    prompt = f"""
    QUESTIONS:
    {questions_text}
    
    STUDENT ANSWERS:
    {student_answers_text}
    
    ANSWER KEY:
    {answer_key_text}
    
    Return a JSON object with these fields:
    1. "problem": The complete problem statement (including all parts)
    2. "student_answer": The student's complete answer (or empty string if not found)
    3. "answer_key": The complete answer from the answer key, including work (or empty string if not found)
    
    Example format:
    {{
      "problem": "Full problem text goes here...",
      "student_answer": "Student's answer goes here...",
      "answer_key": "Answer key solution goes here..."
    }}
    EXTRACT INFO FOR PROBLEM {problem_number}. MAKE SURE TO DO {problem_number}.
    """
    
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=2000,
            temperature=0,
            system="You extract problem information from educational content. Return a JSON object with problem, student_answer, and answer_key fields.",
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        )
        
        content = response.content[0].text
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            json_str = json_match.group(1)
            problem_data = json.loads(json_str)
            return problem_data
        else:
            raise ValueError(f"Could not extract problem data for problem {problem_number}")
            
    except Exception as e:
        print(f"Error generating JSON for problem {problem_number}: {e}")
        return {"problem": "", "student_answer": "", "answer_key": ""}

def process_assessment(questions_text, student_answers_text, answer_key_text, output_file=None, specific_problems=None):
    client = get_anthropic_client()
    
    if specific_problems is None:
        print("Extracting problem numbers...")
        problem_numbers = get_problem_numbers(questions_text, student_answers_text, answer_key_text, client)
        print(f"Found {len(problem_numbers)} problems: {', '.join(problem_numbers)}")
    else:
        problem_numbers = specific_problems
        print(f"Processing {len(problem_numbers)} specified problems: {', '.join(problem_numbers)}")
    
    all_problems = {}
    
    for i, problem_number in enumerate(problem_numbers):
        print(f"Processing problem {problem_number} ({i+1}/{len(problem_numbers)})...")
        problem_data = generate_problem_json(
            problem_number, 
            questions_text, 
            student_answers_text, 
            answer_key_text,
            client
        )
        all_problems[problem_number] = problem_data
    
    output_data = {
        "metadata": {
            "total_problems": len(problem_numbers),
            "problem_numbers": problem_numbers,
            "timestamp": datetime.datetime.now().isoformat()
        },
        "problems": all_problems
    }
    
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Assessment analysis saved to {output_file}")
    
    return output_data

def parse_pdf_to_assessment(pdf_path, answer_key_path, save_intermediate=False):
    try:
        from pdf_to_text import pdf_to_text
        
        # Extract text from PDF
        questions_text = pdf_to_text(pdf_path, save_segments=save_intermediate, 
                                    save_text=save_intermediate)
        
        # Use the same text for student answers in this test case
        student_answers_text = questions_text
        
        # Load answer key
        with open(answer_key_path, 'r') as f:
            answer_key_text = f.read()
        
        # Process the assessment
        output_file = "assessment_analysis.json" if save_intermediate else None
        return process_assessment(
            questions_text,
            student_answers_text,
            answer_key_text,
            output_file
        )
        
    except Exception as e:
        print(f"Error in PDF to assessment parsing: {e}")
        return None

# CLI Interface
if __name__ == "__main__":
    import fire
    
    def parse_assessment(questions_file, answer_key_file, output_file="assessment_analysis.json", 
                         student_answers_file=None):
        """
        Parse problems from text files and generate assessment analysis.
        
        Args:
            questions_file: Path to the file containing questions
            answer_key_file: Path to the answer key file
            output_file: Path to save the output JSON
            student_answers_file: Path to student answers file (if different from questions)
        """
        try:
            # Check if the required files exist
            if not os.path.exists(questions_file):
                print(f"Error: Questions file '{questions_file}' not found")
                return
                
            if not os.path.exists(answer_key_file):
                print(f"Error: Answer key file '{answer_key_file}' not found")
                return
            
            # If student_answers_file not specified, use questions_file
            if student_answers_file is None:
                student_answers_file = questions_file
            elif not os.path.exists(student_answers_file):
                print(f"Error: Student answers file '{student_answers_file}' not found")
                return
            
            print(f"Using files:")
            print(f"  Questions: {questions_file}")
            print(f"  Student answers: {student_answers_file}")
            print(f"  Answer key: {answer_key_file}")
            
            # Load input files
            with open(questions_file, 'r') as f:
                questions_text = f.read()
            
            with open(student_answers_file, 'r') as f:
                student_answers_text = f.read()
            
            with open(answer_key_file, 'r') as f:
                answer_key_text = f.read()
            
            # Process the assessment
            results = process_assessment(
                questions_text,
                student_answers_text,
                answer_key_text,
                output_file
            )
            
            print("Assessment parsing completed successfully!")
            return results
            
        except Exception as e:
            print(f"Error parsing assessment: {e}")
            return None
    
    fire.Fire({
        "parse_assessment": parse_assessment,
        "parse_pdf": parse_pdf_to_assessment
    })