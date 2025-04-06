# Handwritten Exam OCR System

This system provides OCR capabilities for handwritten student exams using a two-stage approach.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```

## Testing Individual Functions

Use the test script to test each function in isolation:

### 1. Test Image Encoding

```
python test_ocr_functions.py --function encode --image examples/screenshot-page2.png
```

### 2. Test Document Analysis (Stage 1)

```
python test_ocr_functions.py --function analyze --image examples/screenshot-page2.png
```

This will generate an analysis JSON file with document structure.

### 3. Test Region Extraction

```
python test_ocr_functions.py --function extract --image examples/screenshot-page2.png --question 9 --analysis_file analysis_screenshot-page2.json
```

This will extract the region for question 9 and save it as an image.

### 4. Test Answer Transcription (Stage 2)

```
python test_ocr_functions.py --function transcribe --image region_q9.png --type numerical
```

This will transcribe the handwritten answer for question 9.

### 5. Direct API Test with Custom Prompt

```
python test_ocr_functions.py --function direct --image region_q9.png --prompt "Transcribe ONLY the digits in this handwritten answer. Do not interpret or correct the answer."
```

## Full Process

To run the entire pipeline:

```
python ocr_poc.py
```

This will process a sample exam page and save the results to `ocr_results.json`.

## Architecture

The system follows a two-stage approach:

1. **Document Analysis**: Identify questions and answer regions
2. **Targeted OCR**: Extract and transcribe handwritten answers

See `OCR_System_Design.md` for detailed architecture information.

## Test Different Prompts

Experiment with different prompts for the OCR stage:

- **For numerical answers**:
  - "Transcribe ONLY the handwritten digits in this image, exactly as written"
  - "What number is written in this image? Give only the digits without interpretation"

- **For multiple choice**:
  - "Which option is circled or marked by the student? Return only the letter"
  - "Identify the selected option in this multiple-choice question"

- **For text answers**:
  - "Transcribe the handwritten text in this image exactly as written"
  - "Write down all text visible in the student's handwriting"