# OCR Assessment Pipeline

A pipeline for extracting text from PDF assessments, parsing problems, and grading student answers against an answer key.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up API keys:
   - Copy the example environment file: `cp .env.example .env`
   - Edit `.env` and add your API keys:
     ```
     OPENAI_API_KEY=your_openai_key
     ANTHROPIC_API_KEY=your_anthropic_key
     GEMINI_API_KEY=your_gemini_key
     ```

## Usage

### End-to-End Pipeline

Process a PDF assessment from start to finish:

```
python grader.py process "Weekly practice 1.pdf" "weekly practice 1 answer key.txt" --save_intermediate
```

Arguments:
- `pdf_path`: Path to the PDF assessment
- `answer_key_path`: Path to the answer key text file
- `--save_intermediate`: (Optional) Save intermediate results to files
- `--output_file`: (Optional) Custom path for the output file

### Individual Steps

#### 1. Extract Text from PDF

```
python pdf_to_text.py "Weekly practice 1.pdf" --save_segments=True --save_text=True
```

#### 2. Generate Assessment Analysis

```
python assessment_parser.py parse_assessment "Weekly practice 1.txt" "weekly practice 1 answer key.txt"
```

#### 3. Grade the Assessment

```
python grader.py grade_file "assessment_analysis.json"
```

## Pipeline Process

1. **PDF to Text**: Converts PDF to text using GPT-4o OCR
   - Segments PDF pages for better OCR accuracy
   - Uses vision capabilities to extract text with math symbols
   
2. **Assessment Parsing**: Uses Claude to parse problems from text
   - Identifies problem numbers
   - Extracts problem statements, student answers, and answer key
   
3. **Grading**: Uses Gemini 2.5 Pro to grade answers
   - Compares student answers to answer key
   - Provides percentage scores and feedback
   - Calculates overall assessment score

## Models Used

- **OCR Processing**: OpenAI GPT-4o
- **Assessment Parsing**: Anthropic Claude 3.7 Sonnet
- **Grading**: Google Gemini 2.5 Pro (03-25 experimental)