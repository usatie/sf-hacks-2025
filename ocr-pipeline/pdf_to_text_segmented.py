import os
import base64
import io
import numpy as np
from PIL import Image
from openai import OpenAI
from pdf2image import convert_from_path

# Hard-coded PDF path
PDF_FILE = "Weekly practice 1.pdf"
# Generate output filename based on input file (replace .pdf with .txt)
OUTPUT_FILE = PDF_FILE.replace('.pdf', '.txt')
# Directory for saving image slices
IMAGE_DIR = "pdf_images"

# Target height for image segments (in pixels)
TARGET_HEIGHT = 800
# Minimum segment height
MIN_HEIGHT = 200
# Weights for cost function
HEIGHT_WEIGHT = 1.0
STD_WEIGHT = 5.0

def segment_image(image, target_height=TARGET_HEIGHT, min_height=MIN_HEIGHT):
    """Segment image using minimum cost approach based on row std dev"""
    # Convert to grayscale numpy array
    img_array = np.array(image.convert('L'))
    height, width = img_array.shape
    
    # Calculate standard deviation for each row (vectorized)
    row_std_devs = np.array([np.std(img_array[i, :]) for i in range(height)])
    
    # Smooth the std devs slightly
    window_size = 5
    kernel = np.ones(window_size) / window_size
    smoothed_std_devs = np.convolve(row_std_devs, kernel, mode='same')
    
    # Find optimal cutting points
    segments = []
    current_start = 0
    
    while current_start < height - min_height:
        remaining_height = height - current_start
        
        # If remaining height is less than target, make it the last segment
        if remaining_height <= target_height:
            segments.append((current_start, height))
            break
        
        # Calculate costs for all possible cutting points
        possible_end = current_start + min_height
        max_end = min(current_start + target_height * 2, height)  # Look ahead up to 2x target
        
        # Calculate cost for each possible cutting point
        costs = np.zeros(max_end - possible_end)
        
        for i in range(possible_end, max_end):
            segment_height = i - current_start
            height_cost = HEIGHT_WEIGHT * abs(segment_height - target_height)
            std_cost = STD_WEIGHT * (smoothed_std_devs[i] ** 2)
            costs[i - possible_end] = height_cost + std_cost
        
        # Find minimum cost cutting point
        min_cost_idx = np.argmin(costs)
        cut_point = possible_end + min_cost_idx
        
        # Add segment
        segments.append((current_start, cut_point))
        current_start = cut_point
    
    # Extract image segments
    image_segments = []
    for start, end in segments:
        segment = image.crop((0, start, width, end))
        image_segments.append(segment)
    
    return image_segments, segments

# Function to save image segments
def save_segments(image_segments, page_num, output_dir=IMAGE_DIR):
    """Save image segments to disk for visualization"""
    # Create output directory if it doesn't exist
    segments_dir = os.path.join(output_dir, f"segments_p{page_num}")
    os.makedirs(segments_dir, exist_ok=True)
    
    # Save each segment
    saved_paths = []
    for i, segment in enumerate(image_segments):
        # Create filename with page and segment numbers
        segment_path = os.path.join(segments_dir, f"segment_{i+1}.png")
        
        # Save the image
        segment.save(segment_path, "PNG")
        print(f"  Saved segment {i+1} to {segment_path}")
        saved_paths.append(segment_path)
    
    return saved_paths

def pdf_to_text_segmented(save_segments_to_disk=True):
    """PDF to text extraction using GPT-4o vision with image segmentation"""
    
    # Check for API key in file first, then environment
    api_key = None
    api_key_file = "api_key.txt"
    
    # Try to read from file
    try:
        if os.path.exists(api_key_file):
            with open(api_key_file, 'r') as f:
                api_key = f.read().strip()
                print(f"Using API key from {api_key_file}")
    except Exception as e:
        print(f"Error reading API key file: {e}")
    
    # Fall back to environment variable
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("Error: No API key found in file or environment")
            return
    
    client = OpenAI(api_key=api_key)
    
    # Convert PDF to images
    print(f"Converting PDF to images: {PDF_FILE}")
    images = convert_from_path(PDF_FILE, dpi=150)
    print(f"Found {len(images)} pages - processing")
    
    # OCR prompt
    prompt = """
    Do OCR on this image. OUTPUT NOTHING ELSE. Use Unicode math symbols if applicable. If no text, return empty string.
    """
    
    all_text = []
    
    # Process each page
    for i, image in enumerate(images):
        print(f"Processing page {i+1}...")
        
        # Segment the image
        print(f"  Segmenting image...")
        image_segments, segment_coords = segment_image(image)
        print(f"  Created {len(image_segments)} segments")
        
        # Save segments to disk if requested
        if save_segments_to_disk:
            save_segments(image_segments, i+1)
        
        print(f"  Processing {len(image_segments)} segments")
        
        # Process each segment
        page_segments_text = []
        for j, segment in enumerate(image_segments):
            print(f"  Processing segment {j+1}/{len(image_segments)}...")
            
            # Convert to base64
            buffered = io.BytesIO()
            segment.save(buffered, format="PNG")
            base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            # Send to GPT-4o
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500
            )
            
            # Get result
            segment_text = response.choices[0].message.content
            page_segments_text.append(segment_text)
            print(f"  ✓ Segment {j+1} processed")
        
        # Combine segments for this page
        page_text = "\n".join(page_segments_text)
        all_text.append(page_text)
        print(f"✓ Page {i+1} processed with {len(image_segments)} segments")
    
    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        for i, text in enumerate(all_text):
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
    
    print(f"All text extracted to {OUTPUT_FILE}")

if __name__ == "__main__":
    pdf_to_text_segmented(save_segments_to_disk=True)