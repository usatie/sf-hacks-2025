# Handwritten Exam OCR System Design

## Overview

This document outlines a system for Optical Character Recognition (OCR) of handwritten student exam papers. The system aims to accurately transcribe student answers while minimizing API calls and preventing bias toward expected answers.

## Challenges

1. **Accuracy vs. Cost**: OCR of entire documents is expensive and can introduce biases toward expected answers
2. **Handwriting Variability**: Student handwriting varies greatly in style, clarity, and positioning
3. **Document Layout**: Need to correctly identify question-answer pairs without hardcoded coordinates
4. **Contextual Bias**: OCR systems tend to "correct" unclear text toward expected answers

## System Architecture

The system will use a two-stage approach to balance accuracy and cost:

### Stage 1: Document Analysis

**Purpose**: Identify document structure and locate handwritten regions

**Implementation**:
- Process each page of the exam document with a single GPT-4 Vision API call
- Generate a document map containing:
  - Question boundaries (coordinates)
  - Question types (multiple choice, numerical, text, etc.)
  - Handwritten answer regions (coordinates)
- Output structured JSON for downstream processing

**Sample API Prompt**:
```
Analyze this exam page and identify:
1. Each question's bounding box (x1,y1,x2,y2)
2. The question type (multiple-choice, numerical, text)
3. The region containing the student's handwritten answer (x1,y1,x2,y2)
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
```

### Stage 2: Targeted OCR

**Purpose**: Accurately transcribe handwritten text without bias

**Implementation**:
- Extract image regions identified in Stage 1
- Process each handwritten region with specialized prompts based on question type
- Batch similar question types when possible to reduce API calls

**Sample API Prompts (by question type)**:

- **Numerical**:
  ```
  Transcribe ONLY the handwritten digits in this image.
  Do not interpret or correct the answer, even if it seems wrong.
  Return exactly what is written, digit by digit.
  ```

- **Multiple Choice**:
  ```
  Identify which option is circled or marked by the student.
  Return only the letter or number of the selected option.
  ```

- **Text Answer**:
  ```
  Transcribe the handwritten text in this image exactly as written.
  Preserve any errors, crossed-out text, or notations.
  ```

## Optimization Strategies

1. **Batching**:
   - Group similar question types into a single API call
   - Process multiple small regions in one API call (within token limits)

2. **Caching**:
   - Store document structure for exams with consistent formats
   - Reuse analysis for multiple student submissions of the same exam

3. **Hybrid Approach**:
   - Use OpenCV for initial preprocessing (contrast enhancement, deskewing)
   - Apply traditional CV techniques to help locate handwriting regions
   - Use machine learning only for the transcription of identified regions

4. **Confidence Scoring**:
   - For critical answers, process the same region multiple times with different prompts
   - Implement a voting or confidence scoring system to resolve discrepancies

## Implementation Plan

### Phase 1: Document Analysis System
- Implement document structure extraction
- Build JSON schema for document mapping
- Create visualization tools for verification

### Phase 2: Targeted OCR System
- Implement region extraction based on document map
- Develop question-type detection
- Create specialized prompts for each question type
- Build batching system for similar regions

### Phase 3: Validation and Optimization
- Develop confidence scoring system
- Implement caching mechanisms
- Create feedback loop for continuous improvement
- Add traditional CV preprocessing for improved accuracy

## Evaluation Metrics

1. **OCR Accuracy**: Character-level accuracy compared to ground truth
2. **Cost Efficiency**: Number of API calls per exam
3. **Processing Time**: End-to-end processing time per exam
4. **Bias Resistance**: Frequency of OCR outputs matching expected answers despite different handwritten input