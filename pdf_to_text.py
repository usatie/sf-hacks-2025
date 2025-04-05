import os
import base64
import io
from openai import OpenAI
from pdf2image import convert_from_path

# Hard-coded PDF path
PDF_FILE = "Weekly practice 1.pdf"
OUTPUT_FILE = "extracted_text.txt"

# Set your OpenAI API key here (or keep it in env variable)
# os.environ["OPENAI_API_KEY"] = "your-api-key-here"

def pdf_to_text():
    """Simple PDF to text extraction using GPT-4o vision"""
    
    # Check API key
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not set in environment")
        return
    
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # Convert PDF to images
    print(f"Converting PDF to images: {PDF_FILE}")
    images = convert_from_path(PDF_FILE, dpi=150)
    print(f"Found {len(images)} pages - will process ALL of them")
    
    # OCR prompt
    prompt = r"""
    Do OCR on this image. OUTPUT NOTHING ELSE
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
        page_text = response.choices[0].message.content
        all_text.append(page_text)
        print(f"✓ Page {i+1} processed")
    
    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        for i, text in enumerate(all_text):
            f.write(f"=== PAGE {i+1} ===\n\n")
            f.write(text)
            f.write("\n\n")
    
    print(f"All text extracted to {OUTPUT_FILE}")

if __name__ == "__main__":
    pdf_to_text()