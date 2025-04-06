# AI Grader

Automated grading system for math assessments using Claude AI.

## Workflow Overview

This system processes PDF assessments and grades student answers through the following pipeline:

1. **PDF to Images** (`convert_pdf.py`)
   - Converts PDF documents to high-resolution images
   - Handles multi-page documents with proper segmentation

2. **OCR Text Extraction** (`pdf_to_text_segmented.py`) 
   - Extracts text from images using OCR
   - Segments images to improve accuracy
   - Maintains mathematical notation in Unicode format

3. **Content Parsing** (`assessment_parser.py`)
   - Identifies questions, student answers, and answer keys
   - Creates structured JSON mapping of problem numbers to content
   - Processes content with Claude to ensure accurate parsing

4. **Automated Grading** (`grader.py`)
   - Grades each problem using Claude AI
   - Provides percentage scores and feedback for each problem
   - Calculates overall assessment score
   - Generates complete grading report

## Usage

### Prerequisites

- Python 3.8+
- Anthropic API key (Claude)
- OpenAI API key (for GPT-4o Vision OCR)
- Required dependencies: `anthropic`, `openai`, `pdf2image`, etc.

### Setup

```bash
# Install dependencies
pip install anthropic openai pdf2image pillow

# Set API keys
export ANTHROPIC_API_KEY=your_anthropic_api_key_here

# The OCR step also needs an OpenAI API key, either:
# Option 1: Set as environment variable
export OPENAI_API_KEY=your_openai_api_key_here

# Option 2: Create an api_key.txt file
echo "your_openai_api_key_here" > api_key.txt
```

### Running the Pipeline

1. **Convert PDF to Images**
   ```bash
   python convert_pdf.py
   ```

2. **Extract Text with OCR**
   ```bash
   python pdf_to_text_segmented.py
   ```

3. **Parse Questions and Answers**
   ```bash
   python assessment_parser.py
   ```

4. **Grade the Assessment**
   ```bash
   python grader.py
   ```

The final output is saved to `graded_assessment.json`, containing detailed grading information for each problem.