import os
import base64
import io
from openai import OpenAI
from pdf2image import convert_from_path

# Hard-coded PDF path
PDF_FILE = "Weekly practice 1.pdf"
# Generate output filename based on input file (replace .pdf with .txt)
OUTPUT_FILE = PDF_FILE.replace('.pdf', '.txt')

# Set your OpenAI API key here (or keep it in env variable)
# os.environ["OPENAI_API_KEY"] = "your-api-key-here"

def pdf_to_text():
    """Simple PDF to text extraction using GPT-4o vision"""
    
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
    Do OCR on this image. OUTPUT NOTHING ELSE.  use Unicode math symbols if applicable. If no text, return empty string.
    """
    
    all_text = []
    
    # Process each page
    for i, image in enumerate(images):
        print(f"Processing page {i+1}...")
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # Send to GPT-4o
        response = client.chat.completions.create(
            model="chatgpt-4o-latest",
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
        page_text = response.choices[0].message.content
        all_text.append(page_text)
        print(f"✓ Page {i+1} processed")
    
    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        for i, text in enumerate(all_text):
            f.write(f"--- Page {i+1} ---\n")
            f.write(text)
            f.write("\n\n")
    
    print(f"All text extracted to {OUTPUT_FILE}")

if __name__ == "__main__":
    pdf_to_text()