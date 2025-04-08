import os
import base64
import io
import numpy as np
from PIL import Image
from openai import OpenAI
from pdf_to_image import pdf_to_images
import fire
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Default settings
TARGET_HEIGHT = 400
MIN_HEIGHT = 200
HEIGHT_WEIGHT = 1.0
STD_WEIGHT = 5.0
IMAGE_DIR = "pdf_images"

def segment_image(image, target_height=TARGET_HEIGHT, min_height=MIN_HEIGHT):
    img_array = np.array(image.convert('L'))
    height, width = img_array.shape
    
    row_std_devs = np.array([np.std(img_array[i, :]) for i in range(height)])
    
    window_size = 5
    kernel = np.ones(window_size) / window_size
    smoothed_std_devs = np.convolve(row_std_devs, kernel, mode='same')
    
    segments = []
    current_start = 0
    
    while current_start < height - min_height:
        remaining_height = height - current_start
        
        if remaining_height <= target_height:
            segments.append((current_start, height))
            break
        
        possible_end = current_start + min_height
        max_end = min(current_start + target_height * 2, height)
        
        costs = np.zeros(max_end - possible_end)
        
        for i in range(possible_end, max_end):
            segment_height = i - current_start
            height_cost = HEIGHT_WEIGHT * abs(segment_height - target_height)
            std_cost = STD_WEIGHT * (smoothed_std_devs[i] ** 2)
            costs[i - possible_end] = height_cost + std_cost
        
        min_cost_idx = np.argmin(costs)
        cut_point = possible_end + min_cost_idx
        
        segments.append((current_start, cut_point))
        current_start = cut_point
    
    image_segments = []
    for start, end in segments:
        segment = image.crop((0, start, width, end))
        image_segments.append(segment)
    
    return image_segments, segments

def save_segments(image_segments, page_num, output_dir=IMAGE_DIR):
    segments_dir = os.path.join(output_dir, f"segments_p{page_num}")
    os.makedirs(segments_dir, exist_ok=True)
    
    saved_paths = []
    for i, segment in enumerate(image_segments):
        segment_path = os.path.join(segments_dir, f"segment_{i+1}.png")
        segment.save(segment_path, "PNG")
        print(f"  Saved segment {i+1} to {segment_path}")
        saved_paths.append(segment_path)
    
    return saved_paths

def get_openai_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("No OpenAI API key found in environment variables")
    
    return OpenAI(api_key=api_key)

def extract_text_from_images(images, client=None, save_segments_to_disk=False):
    if client is None:
        client = get_openai_client()
    
    prompt = """
    Do OCR on this image. OUTPUT NOTHING ELSE. Use Unicode math symbols if applicable. If no text, return empty string.
    """
    
    all_text = []
    
    for i, image in enumerate(images):
        print(f"Processing page {i+1}...")
        
        image_segments, segment_coords = segment_image(image)
        print(f"  Created {len(image_segments)} segments")
        
        if save_segments_to_disk:
            save_segments(image_segments, i+1)
        
        page_segments_text = []
        for j, segment in enumerate(image_segments):
            print(f"  Processing segment {j+1}/{len(image_segments)}...")
            
            buffered = io.BytesIO()
            segment.save(buffered, format="PNG")
            base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
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
            
            segment_text = response.choices[0].message.content
            page_segments_text.append(segment_text)
            print(f"  ✓ Segment {j+1} processed")
        
        page_text = "\n".join(page_segments_text)
        all_text.append(page_text)
        print(f"✓ Page {i+1} processed with {len(image_segments)} segments")
    
    return all_text

def pdf_to_text(pdf_path, save_segments=False, save_text=False, output_file=None, dpi=150):
    """
    Convert PDF to text using GPT-4o's vision capabilities.
    
    Args:
        pdf_path: Path to the PDF file
        save_segments: Whether to save image segments to disk
        save_text: Whether to save the extracted text to a file
        output_file: Path to save the text file (defaults to PDF path with .txt extension)
        dpi: Resolution for PDF to image conversion
    
    Returns:
        str: The extracted text from the PDF
    """
    print(f"Converting PDF to images: {pdf_path}")
    images = pdf_to_images(pdf_path, dpi=dpi)
    print(f"Found {len(images)} pages - processing")
    
    client = get_openai_client()
    all_text = extract_text_from_images(images, client, save_segments)
    
    formatted_text = ""
    for i, text in enumerate(all_text):
        formatted_text += f"--- Page {i+1} ---\n{text}\n\n"
    
    if save_text:
        if output_file is None:
            output_file = pdf_path.replace('.pdf', '.txt')
        with open(output_file, "w") as f:
            f.write(formatted_text)
        print(f"All text extracted to {output_file}")
    
    return formatted_text

if __name__ == "__main__":
    fire.Fire({
        "extract": pdf_to_text
    })