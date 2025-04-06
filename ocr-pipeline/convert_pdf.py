from pdf2image import convert_from_path
import os


def pdf_to_images(pdf_path, dpi=300):
    """
    Convert a PDF to an array of PIL Images
    
    Args:
        pdf_path (str): Path to the PDF file
        dpi (int): DPI for image resolution (higher = better quality)
        
    Returns:
        list: Array of PIL Image objects
    """
    return convert_from_path(pdf_path, dpi=dpi)

# Optional utility function for saving images - not part of core functionality
def save_images(images, output_dir="pdf_images", format="PNG", prefix="page"):
    """
    Save an array of images to disk
    
    Args:
        images (list): List of PIL Image objects
        output_dir (str): Directory to save images
        format (str): Image format (PNG, JPEG, etc.)
        prefix (str): Filename prefix
    
    Returns:
        list: List of saved image paths
    """
    os.makedirs(output_dir, exist_ok=True)
    
    saved_paths = []
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f'{prefix}_{i+1}.{format.lower()}')
        image.save(image_path, format)
        print(f"Saved {image_path}")
        saved_paths.append(image_path)
    
    return saved_paths

# Main functionality when script is run directly (for testing/debugging)
if __name__ == "__main__":
    # Path to the PDF file
    pdf_path = "Weekly practice 1.pdf"
    
    # Core functionality: just get images from PDF
    images = pdf_to_images(pdf_path, dpi=150)
    print(f"Converted {len(images)} pages from {pdf_path}")
    
    # Optional: save images for debugging/testing
    output_dir = "pdf_images"
    os.makedirs(output_dir, exist_ok=True)
    
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f'page_{i+1}.png')
        image.save(image_path, 'PNG')
        print(f"Saved {image_path}")
    
    print(f"Saved images to {output_dir}/")