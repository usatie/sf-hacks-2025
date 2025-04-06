import json
import anthropic
import os

def grade_problem(problem_data):
    """
    Grade a single problem using Claude.
    
    Args:
        problem_data (dict): Problem data containing problem, student_answer, and answer_key
    
    Returns:
        tuple: (percentage, feedback)
    """
    # Initialize the Anthropic client
    client = anthropic.Anthropic()
    
    # Extract problem components
    problem = problem_data.get("problem", "")
    student_answer = problem_data.get("student_answer", "")
    answer_key = problem_data.get("answer_key", "")
    
    # Create the prompt for Claude
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
    
    # Send request to Claude
    try:
        response = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=500,
            temperature=0,
            system="You are a math grader. Grade student answers with a percentage and provide brief feedback only when points are deducted.",
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
        import re
        json_match = re.search(r'({[\s\S]*})', content)
        if json_match:
            json_str = json_match.group(1)
            result = json.loads(json_str)
            return result.get("percentage", 0), result.get("feedback", "")
        else:
            return 0, "Error: Could not parse grading response"
            
    except Exception as e:
        return 0, f"Error grading problem: {str(e)}"

def grade_assessment(assessment_file, output_file="graded_assessment.json"):
    """
    Grade all problems in an assessment and save the results.
    
    Args:
        assessment_file (str): Path to the assessment analysis JSON file
        output_file (str): Path to save the graded assessment
        
    Returns:
        dict: The graded assessment data
    """
    # Load assessment data
    with open(assessment_file, 'r') as f:
        assessment_data = json.load(f)
    
    # Get problems
    problems = assessment_data.get("problems", {})
    total_problems = len(problems)
    
    print(f"Grading {total_problems} problems...")
    
    # Grade each problem
    total_score = 0
    
    for i, (problem_id, problem_data) in enumerate(problems.items()):
        print(f"Grading problem {problem_id} ({i+1}/{total_problems})...")
        
        # Grade the problem
        percentage, feedback = grade_problem(problem_data)
        
        # Add grading to problem data
        problem_data["grade_percentage"] = percentage
        problem_data["feedback"] = feedback
        
        # Update total score
        total_score += percentage
    
    # Add overall score
    if total_problems > 0:
        assessment_data["overall_score"] = total_score / total_problems
    else:
        assessment_data["overall_score"] = 0
    
    # Save graded assessment
    with open(output_file, 'w') as f:
        json.dump(assessment_data, f, indent=2)
    
    print(f"Grading complete! Overall score: {assessment_data['overall_score']:.2f}%")
    print(f"Results saved to {output_file}")
    
    return assessment_data

# Test grading
if __name__ == "__main__":
    # Check if API key is set
    if "ANTHROPIC_API_KEY" not in os.environ:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your API key with: export ANTHROPIC_API_KEY=your_key_here")
        exit(1)
    
    # Check if input file exists
    input_file = "assessment_analysis.json"
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        exit(1)
    
    # Grade the assessment
    grade_assessment(input_file)