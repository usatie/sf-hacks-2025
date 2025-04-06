import os
import json
import cv2
import argparse
import sys
sys.path.append(".")
from ocr_poc import encode_image, call_gpt_vision, analyze_document_structure, extract_answer_region, transcribe_answer

def test_encode_image(image_path):
    """Test the image encoding function"""
    print(f"Testing image encoding for: {image_path}")
    encoded = encode_image(image_path)
    print(f"Successfully encoded image: {len(encoded)} bytes")
    return encoded

def test_document_analysis(image_path):
    """Test the document structure analysis (Stage 1)"""
    print(f"Testing document structure analysis for: {image_path}")
    result = analyze_document_structure(image_path)
    
    if result:
        print(f"Successfully analyzed document:")
        print(json.dumps(result, indent=2))
        
        # Save result for reference
        with open(f"analysis_{os.path.basename(image_path).split('.')[0]}.json", "w") as f:
            json.dump(result, f, indent=2)
    else:
        print("Failed to analyze document")
    
    return result

def test_region_extraction(image_path, question_data):
    """Test the region extraction function"""
    print(f"Testing region extraction for question {question_data['id']}")
    
    # Extract the region
    region = extract_answer_region(image_path, question_data)
    
    # Save the region for visual inspection
    output_path = f"region_q{question_data['id']}.png"
    cv2.imwrite(output_path, region)
    print(f"Saved extracted region to {output_path}")
    
    return region

def test_answer_transcription(region_image, question_type):
    """Test the answer transcription function (Stage 2)"""
    print(f"Testing answer transcription for question type: {question_type}")
    
    result = transcribe_answer(region_image, question_type)
    
    if result:
        print(f"Transcribed answer: {result}")
    else:
        print("Failed to transcribe answer")
    
    return result

def test_direct_api_call(image_path, prompt):
    """Test a direct API call with custom prompt"""
    print(f"Testing direct API call with custom prompt")
    
    encoded = encode_image(image_path)
    response = call_gpt_vision(prompt, encoded)
    
    try:
        content = response['choices'][0]['message']['content']
        print(f"API Response: {content}")
        return content
    except Exception as e:
        print(f"Error with API call: {e}")
        print(response)
        return None

def main():
    parser = argparse.ArgumentParser(description='Test OCR functions')
    parser.add_argument('--function', type=str, choices=['encode', 'analyze', 'extract', 'transcribe', 'direct'],
                        help='Function to test')
    parser.add_argument('--image', type=str, help='Path to image file')
    parser.add_argument('--question', type=int, help='Question ID for extraction/transcription')
    parser.add_argument('--type', type=str, choices=['numerical', 'multiple-choice', 'text'], 
                        help='Question type for transcription')
    parser.add_argument('--prompt', type=str, help='Custom prompt for direct API test')
    parser.add_argument('--analysis_file', type=str, help='Path to analysis JSON file')
    
    args = parser.parse_args()
    
    if args.function == 'encode' and args.image:
        test_encode_image(args.image)
    
    elif args.function == 'analyze' and args.image:
        test_document_analysis(args.image)
    
    elif args.function == 'extract' and args.image and args.question and args.analysis_file:
        # Load question data from analysis file
        with open(args.analysis_file, 'r') as f:
            analysis = json.load(f)
        
        # Find the question with matching ID
        question_data = None
        for q in analysis['questions']:
            if q['id'] == args.question:
                question_data = q
                break
        
        if question_data:
            test_region_extraction(args.image, question_data)
        else:
            print(f"Question ID {args.question} not found in analysis file")
    
    elif args.function == 'transcribe' and args.image and args.type:
        # Load image directly for transcription
        img = cv2.imread(args.image)
        test_answer_transcription(img, args.type)
    
    elif args.function == 'direct' and args.image and args.prompt:
        test_direct_api_call(args.image, args.prompt)
    
    else:
        print("Error: Missing required arguments")
        parser.print_help()

if __name__ == "__main__":
    main()