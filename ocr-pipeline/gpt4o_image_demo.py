import os
import base64
from openai import OpenAI
import convert_pdf

# Function to encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

# Function to analyze image using PIL Image object directly (no file needed)
def analyze_image_with_openai(pil_image, prompt="Describe this image in detail"):
    """
    Analyze an image using OpenAI's GPT-4o vision capabilities
    
    Args:
        pil_image: PIL Image object
        prompt: Prompt for GPT-4o
        
    Returns:
        str: GPT-4o's response
    """
    # Save image to temporary file
    import tempfile
    temp_dir = tempfile.gettempdir()
    temp_image_path = os.path.join(temp_dir, "temp_image.png")
    pil_image.save(temp_image_path)
    
    # Get base64 encoding
    base64_image = encode_image(temp_image_path)
    
    # Remove temp file
    os.remove(temp_image_path)
    
    # Initialize OpenAI client
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # Create payload with image
    response = client.chat.completions.create(
        model="gpt-4o",  # Make sure to use gpt-4o model
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
        max_tokens=500
    )
    
    return response.choices[0].message.content

if __name__ == "__main__":
    # Check if API key is set
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Please set it using:")
        print("export OPENAI_API_KEY='your-api-key'")
        exit(1)
    
    # Get images from PDF
    pdf_path = "Weekly practice 1.pdf"
    print(f"Converting PDF to images: {pdf_path}")
    images = convert_pdf.pdf_to_images(pdf_path, dpi=150)
    
    # Analyze the first page
    if images:
        print(f"Analyzing page 1 of {len(images)} with GPT-4o...")
        
        # Custom prompt for education content
        custom_prompt = """
        This appears to be an educational document. Please:
        1. Identify the subject/course
        2. Describe the type of document (assignment, quiz, etc.)
        3. Summarize the main content and types of problems
        4. Note any important details about the format or instructions
        """
        
        result = analyze_image_with_openai(images[0], prompt=custom_prompt)
        
        print("\nGPT-4o Analysis Results:")
        print("-" * 50)
        print(result)
    else:
        print("No images found in the PDF.")