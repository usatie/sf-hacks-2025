"""
Simple Hello World demo for Gemini API
"""
import os
import google.generativeai as genai

def hello_gemini():
    """
    Send a simple greeting to Gemini and print the response
    """
    # Get API key from environment variable
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        print("Please set your API key with: export GEMINI_API_KEY=your_key_here")
        return
    
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    # First, list available models
    print("Available models:")
    for model_info in genai.list_models():
        if "gemini" in model_info.name.lower():
            print(f"- {model_info.name}")
    
    # Send a simple greeting to Gemini
    prompt = "Hi, please respond with a very short greeting"
    
    try:
        # Get a model instance
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Make the API call to Gemini
        response = model.generate_content(prompt)
        
        # Print the response
        print("\nResponse from Gemini:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")

if __name__ == "__main__":
    print("Gemini API Hello World Demo")
    print("=" * 30)
    hello_gemini()