import base64
import cv2
import os
import json
from PIL import Image
import numpy as np
import io
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

def encode_image(image_path):
    """Encode an image to base64 for API submission"""
    if isinstance(image_path, str):
        # Load from file path
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    else:
        # Assume it's a numpy array from OpenCV
        _, buffer = cv2.imencode('.png', image_path)
        return base64.b64encode(buffer).decode('utf-8')

def call_gpt_vision(prompt, image, model="gpt-4o"):
    """Call GPT-4 Vision API with prompt and image"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    if isinstance(image, str) and image.startswith("http"):
        # It's a URL
        image_content = {"type": "image_url", "image_url": {"url": image}}
    else:
        # It's base64 encoded
        image_content = {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image}"}}
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    image_content
                ]
            }
        ],
        "max_tokens": 2000
    }
    
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    return response.json()

def analyze_document_structure(image_path):
    """Stage 1: Analyze document to identify questions and answer areas"""
    encoded_image = encode_image(image_path)
    
    prompt = """
    Analyze this exam page and identify:
    1. Each question's bounding box in (x1,y1,x2,y2) format where the coordinates are percentages of image dimension
    2. The question type (multiple-choice, numerical, text, etc.)
    3. The region containing the student's handwritten answer in (x1,y1,x2,y2) format
    
    Format your response as JSON with the structure:
    {
      "questions": [
        {
          "id": 1,
          "type": "numerical",
          "question_box": [x1,y1,x2,y2],
          "answer_box": [x1,y1,x2,y2]
        },
        ...
      ]
    }
    
    Ensure coordinates are percentages (0-100) of image width and height.
    Only include questions that are visible in this image.
    """
    
    response = call_gpt_vision(prompt, encoded_image)
    
    # Extract JSON from the response
    try:
        content = response['choices'][0]['message']['content']
        # Find JSON in the response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = content[json_start:json_end]
            document_structure = json.loads(json_str)
            return document_structure
        else:
            print("JSON not found in response")
            print(content)
            return None
    except Exception as e:
        print(f"Error extracting JSON: {e}")
        print(response)
        return None

def extract_answer_region(image_path, question):
    """Extract the handwritten answer region based on coordinates"""
    img = cv2.imread(image_path)
    height, width = img.shape[:2]
    
    # Get coordinates and convert from percentages to pixels
    x1, y1, x2, y2 = question["answer_box"]
    x1 = int(width * x1 / 100)
    y1 = int(height * y1 / 100)
    x2 = int(width * x2 / 100)
    y2 = int(height * y2 / 100)
    
    # Extract region
    answer_region = img[y1:y2, x1:x2]
    return answer_region

def transcribe_answer(answer_image, question_type):
    """Stage 2: Transcribe the handwritten answer"""
    encoded_image = encode_image(answer_image)
    
    # Different prompts for different question types
    prompts = {
        "numerical": "Transcribe ONLY the handwritten digits in this image. Do not interpret or correct the answer, even if it seems wrong. Return exactly what is written, digit by digit.",
        "multiple-choice": "Identify which option is circled or marked by the student. Return only the letter or number of the selected option.",
        "text": "Transcribe the handwritten text in this image exactly as written. Preserve any errors or notations."
    }
    
    # Use appropriate prompt or default to generic
    prompt = prompts.get(question_type, "Transcribe the handwritten text in this image exactly as written.")
    
    response = call_gpt_vision(prompt, encoded_image)
    
    try:
        content = response['choices'][0]['message']['content']
        return content.strip()
    except Exception as e:
        print(f"Error extracting transcription: {e}")
        print(response)
        return None

def process_exam_page(image_path):
    """Process a single exam page end-to-end"""
    print(f"Processing image: {image_path}")
    
    # Stage 1: Analyze document structure
    print("Stage 1: Analyzing document structure...")
    document_structure = analyze_document_structure(image_path)
    
    if not document_structure:
        print("Failed to analyze document structure")
        return
    
    print(f"Found {len(document_structure['questions'])} questions")
    
    # Stage 2: Process each answer
    results = []
    for question in document_structure['questions']:
        print(f"Processing Question {question['id']} ({question['type']})...")
        
        # Extract answer region
        answer_region = extract_answer_region(image_path, question)
        
        # Save the extracted region for debugging
        debug_path = f"debug_q{question['id']}.png"
        cv2.imwrite(debug_path, answer_region)
        print(f"Saved answer region to {debug_path}")
        
        # Transcribe answer
        answer_text = transcribe_answer(answer_region, question['type'])
        print(f"Transcribed answer: {answer_text}")
        
        results.append({
            "question_id": question['id'],
            "question_type": question['type'],
            "transcribed_answer": answer_text
        })
    
    return results

def main():
    """Main function"""
    # Process a sample page
    image_path = "examples/screenshot-page2.png"
    results = process_exam_page(image_path)
    
    # Save results
    with open("ocr_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Results saved to ocr_results.json")

if __name__ == "__main__":
    main()