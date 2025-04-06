import sys
import cv2
import numpy as np
import os
from ocr_poc import call_gpt_vision, encode_image

# Load image
image_path = "examples/screenshot-page2.png"
img = cv2.imread(image_path)
height, width = img.shape[:2]

# Define coordinates for question 9 (estimated from visual inspection)
# This targets the "73724" handwritten answer at the bottom of page 2
x1, y1, x2, y2 = int(width * 0.22), int(height * 0.83), int(width * 0.52), int(height * 0.88)

# Extract region
answer_region = img[y1:y2, x1:x2]

# Save the region for reference
output_file = "manual_region_q9.png"
cv2.imwrite(output_file, answer_region)
print(f"Saved extracted region to {output_file}")

# Test with different prompts
prompts = [
    "Count how many digits are in this handwritten number, then carefully transcribe each digit in order. Do NOT look at the answer context. Format: 'Count: X, Digits: Y'",
    "This is digit-by-digit OCR. Look at each handwritten character separately. How many digits do you see, and what is each one? Do not try to make sense of the answer.",
    "Describe each handwritten character in this image, moving from left to right. For each character, say what digit it appears to be.",
    "Carefully transcribe EACH handwritten digit from left to right. Pay special attention to whether there are 4, 5, or more digits.",
    "How many strokes or marks make up this handwritten answer? Count each pen stroke carefully, then transcribe the digits you see.",
    "Do OCR on this image. Denote when something is circled/marked. COPY IT EXACTLY."
]

# Test each prompt
for i, prompt in enumerate(prompts):
    print(f"\nPrompt {i+1}: {prompt}")
    encoded_image = encode_image(answer_region)
    response = call_gpt_vision(prompt, encoded_image)
    
    try:
        content = response['choices'][0]['message']['content']
        print(f"Response: {content}")
    except Exception as e:
        print(f"Error: {e}")
        print(response)
