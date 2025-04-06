import os
import anthropic

# For this demo to work, you'll need to set your Anthropic API key as an environment variable
# For example: export ANTHROPIC_API_KEY=your_api_key_here

# Check if API key is set
if "ANTHROPIC_API_KEY" not in os.environ:
    print("Error: ANTHROPIC_API_KEY environment variable not set")
    print("Please set your API key with: export ANTHROPIC_API_KEY=your_key_here")
    exit(1)

# Initialize the client
client = anthropic.Anthropic()

# Send a simple test message
try:
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1000,
        temperature=1,
        system="You are a helpful assistant. Keep responses brief.",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Hello, Claude! This is a test message. Please respond with a short greeting."
                    }
                ]
            }
        ]
    )
    
    # Print the response
    print("Response from Claude:")
    print("-" * 50)
    print(message.content)
    print("-" * 50)
    print("Test completed successfully!")
    
except Exception as e:
    print(f"Error occurred: {e}")