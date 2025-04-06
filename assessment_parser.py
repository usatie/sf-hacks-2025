import json
import re
import anthropic

def get_questions_and_answers(text):
    """
    Extract questions and answers from OCR text using Claude.
    
    Args:
        text (str): The OCR text from the PDF
        
    Returns:
        tuple: (questions_dict, answers_dict) containing the parsed data
    """
    # Initialize the Anthropic client (API key should be set in the environment)
    client = anthropic.Anthropic()
    
    # Create the prompt for Claude
    prompt = f"""
    Parse this math worksheet OCR text into two dictionaries:
    1. "questions": Maps IDs like "2.2.1" to full question text
    2. "answers": Maps IDs to their answers

    Guidelines:
    - Use Unicode for math symbols
    - Include all parts (a,b,c) with main questions
    - Empty string for missing answers
    - include FULL WORK IN ANSWER

    Input text:
    {text}

    Return valid JSON with questions and answers dictionaries.
    """
    
    # Send request to Claude
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=4000,
            temperature=0,  # Use deterministic output for parsing
            system="You are an expert in parsing educational content. You extract questions and answers from worksheets accurately, structuring them into JSON format. Use Unicode math symbols, not LaTeX.",
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
        
        # Find JSON in the response using regex
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            json_str = json_match.group(1)
            result = json.loads(json_str)
            
            # Extract the questions and answers dictionaries
            questions_dict = result.get("questions", {})
            answers_dict = result.get("answers", {})
            
            return questions_dict, answers_dict
        else:
            raise ValueError("Could not extract JSON from Claude's response")
            
    except Exception as e:
        print(f"Error parsing content with Claude: {e}")
        return {}, {}

def get_questions(text):
    """
    Extract just the questions from OCR text.
    
    Args:
        text (str): The OCR text from the PDF
        
    Returns:
        dict: Mapping of question IDs to question text
    """
    questions, _ = get_questions_and_answers(text)
    return questions

def get_answers(text):
    """
    Extract just the answers from OCR text.
    
    Args:
        text (str): The OCR text from the PDF
        
    Returns:
        dict: Mapping of question IDs to answer text
    """
    _, answers = get_questions_and_answers(text)
    return answers

# Save to JSON file
def save_to_json(questions, answers, output_file):
    """Save questions and answers to a JSON file"""
    # Create a combined data structure
    data = {
        "questions": questions,
        "answers": answers,
        "pairs": {}
    }
    
    # Create pairs for easier access
    all_ids = sorted(set(list(questions.keys()) + list(answers.keys())))
    for qid in all_ids:
        data["pairs"][qid] = {
            "question": questions.get(qid, ""),
            "answer": answers.get(qid, "")
        }
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return output_file

# Simple test
if __name__ == "__main__":
    try:
        # Input and output files
        input_file = "Weekly practice 1.txt"
        output_file = "assessment_data.json"
        
        # Load sample text from file
        with open(input_file, "r") as f:
            sample_text = f.read()
        
        print(f"Parsing {input_file}...")
        
        # Get questions and answers
        questions = get_questions(sample_text)
        answers = get_answers(sample_text)
        
        # Save to JSON file
        saved_file = save_to_json(questions, answers, output_file)
        print(f"\nSaved results to {saved_file}")
        
        # Print summary
        print(f"Found {len(questions)} questions and {len(answers)} answers")
        
        # Print a sample of the data
        print("\nSample data:")
        all_ids = sorted(set(list(questions.keys()) + list(answers.keys())))
        if all_ids:
            sample_id = all_ids[0]
            print(f"Question {sample_id}: {questions.get(sample_id, '[Not found]')[:80]}...")
            print(f"Answer {sample_id}: {answers.get(sample_id, '[Not found]')[:80]}...")
        
        # Check if we found questions and answers
        if len(questions) > 0 and len(answers) > 0:
            print("\nTest PASSED: Successfully extracted questions and answers.")
        else:
            print("\nTest FAILED: Failed to extract questions or answers.")
            
    except Exception as e:
        print(f"Error in test: {e}")