import json
import re
import anthropic

def get_problem_numbers(questions_text, student_answers_text, answer_key_text):
    """
    Extract all problem numbers from the questions, student answers, and answer key.
    
    Args:
        questions_text (str): Text containing the problems/questions
        student_answers_text (str): Text containing the student's answers
        answer_key_text (str): Text containing the answer key
        
    Returns:
        list: Sorted list of unique problem numbers
    """
    # Initialize the Anthropic client
    client = anthropic.Anthropic()
    
    # Create the prompt for Claude
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
    
    # Send request to Claude
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=1000,
            temperature=0,
            system="You extract problem numbers from educational content. Return only a JSON array of problem numbers.",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        
        # Extract JSON from Claude's response
        content = response.content[0].text
        
        # Find JSON array in the response using regex
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

def generate_problem_json(problem_number, questions_text, student_answers_text, answer_key_text):
    """
    Generate a JSON entry for a specific problem.
    
    Args:
        problem_number (str): The problem number to process
        questions_text (str): Text containing the problems/questions
        student_answers_text (str): Text containing the student's answers
        answer_key_text (str): Text containing the answer key
        
    Returns:
        dict: JSON entry for the problem
    """
    # Initialize the Anthropic client
    client = anthropic.Anthropic()
    
    # Create the prompt for Claude
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
    #print(f"PROMPT: {prompt}")
    # Send request to Claude
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=2000,
            temperature=0,
            system="You extract problem information from educational content. Return a JSON object with problem, student_answer, and answer_key fields.",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        
        # Extract JSON from Claude's response
        content = response.content[0].text
        
        # Find JSON object in the response using regex
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            json_str = json_match.group(1)
            problem_data = json.loads(json_str)
            return problem_data
        else:
            raise ValueError(f"Could not extract problem data for problem {problem_number} from Claude's response")
            
    except Exception as e:
        print(f"Error generating JSON for problem {problem_number}: {e}")
        return {
            "problem": "",
            "student_answer": "",
            "answer_key": ""
        }

def process_assessment(questions_text, student_answers_text, answer_key_text, output_file=None, specific_problems=None):
    """
    Process an assessment and generate a complete JSON output.
    
    Args:
        questions_text (str): Text containing the problems/questions
        student_answers_text (str): Text containing the student's answers
        answer_key_text (str): Text containing the answer key
        output_file (str, optional): Path to save the output JSON. If None, won't save to file. Defaults to None.
        specific_problems (list, optional): List of specific problem numbers to process.
            If None, all problems will be processed. Defaults to None.
        
    Returns:
        dict: The complete assessment analysis data
    """
    # Get problem numbers (if not specified)
    if specific_problems is None:
        print("Extracting problem numbers...")
        problem_numbers = get_problem_numbers(questions_text, student_answers_text, answer_key_text)
        print(f"Found {len(problem_numbers)} problems: {', '.join(problem_numbers)}")
    else:
        problem_numbers = specific_problems
        print(f"Processing {len(problem_numbers)} specified problems: {', '.join(problem_numbers)}")
    
    # Process each problem
    all_problems = {}
    
    for i, problem_number in enumerate(problem_numbers):
        print(f"Processing problem {problem_number} ({i+1}/{len(problem_numbers)})...")
        problem_data = generate_problem_json(
            problem_number, 
            questions_text, 
            student_answers_text, 
            answer_key_text
        )
        all_problems[problem_number] = problem_data
    
    # Assemble final JSON
    import datetime
    output_data = {
        "metadata": {
            "total_problems": len(problem_numbers),
            "problem_numbers": problem_numbers,
            "timestamp": datetime.datetime.now().isoformat()
        },
        "problems": all_problems
    }
    
    # Write to file if requested
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Assessment analysis saved to {output_file}")
    
    return output_data

# Test the implementation
if __name__ == "__main__":
    try:
        # Define input and output files
        questions_file = "Weekly practice 1.txt"
        student_answers_file = "Weekly practice 1.txt"  # Using the same file for student answers for testing
        answer_key_file = "weekly practice 1 answer key.txt"
        output_file = "assessment_analysis.json"
        
        # Check if the required files exist
        import os
        for file_path in [questions_file, answer_key_file]:
            if not os.path.exists(file_path):
                print(f"Error: File '{file_path}' not found")
                exit(1)
        
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
        
        print("Test completed successfully!")
        
    except Exception as e:
        print(f"Error in test: {e}")