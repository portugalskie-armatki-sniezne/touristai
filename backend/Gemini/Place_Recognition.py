import google.generativeai as genai
import PIL.Image
import os
from pydantic import BaseModel, Field
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_FREE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

class PlaceInfo(BaseModel):
    name: str = Field(description="The name of the building or place")
    city: str = Field(description="The city where the place is located")
    country: str = Field(description="The country where the place is located")
    tour_guide_description: str = Field(description="The 1000-word 'Tour Guide' style narrative and historical fact")
    is_landmark: bool = Field(description="True if it is a well-known landmark, False otherwise")

def recognize_landmark(image_path: str, long: float, lat: float) -> str:
    """
    Identifies a landmark from an image path and coordinates using Gemini Flash.
    Returns a text description of the recognized object.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    try:
        if not os.path.exists(image_path):
            return f"Error: File not found at {image_path}"

        sample_file = PIL.Image.open(image_path)

        # The dynamic user prompt
        prompt = (
            "You are an expert virtual tour guide giving a world tour. Your tone is engaging, "
            "knowledgeable, and witty. You specialize in connecting visual landmarks with "
            "geographic and historical context. "
            f"Identify the building or place in this image. "
            f"The image was taken near coordinates: longitude {long}, latitude {lat}. "
            "\nTasks:\n"
            "1. Identify the name, city, and country of the place.\n"
            "2. Provide a 'Tour Guide' style description with one fascinating historical fact it should be 1000 words long.\n"
            "3. Make it an interesting narrative for the reader.\n"
            "4. If the specific building is not a famous landmark or is unknown:\n"
            "   - Identify the architectural style and distinguishing features of the area.\n"
            "   - Provide information about the broader region.\n"
            "   - Mention 2-3 other famous landmarks in the surrounding vicinity to provide context."
        )

        # Using structured output for internal consistency but returning as text as requested
        response = model.generate_content(
            [prompt, sample_file],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=PlaceInfo
            )
        )

        if response and response.text:
            data = json.loads(response.text)
            place = PlaceInfo(**data)

            # This is the line that was crashing:
            # Change 'place.historical_fact' to 'place.tour_guide_description'
            return (
                f"Recognized Object: {place.name}\n"
                f"Location: {place.city}, {place.country}\n"
                f"Virtual Tour: {place.tour_guide_description}"
            )
        
        return "The place could not be identified."

    except Exception as e:
        return f"Error during recognition: {str(e)}"

# Placeholder for FastAPI later
"""
from fastapi import APIRouter, UploadFile, File, Form
router = APIRouter()

@router.post("/recognize")
async def recognize_place(
    file: UploadFile = File(...), 
    long: float = Form(...), 
    lat: float = Form(...)
):
    # Logic to process upload and call recognize_landmark
    pass
"""

if __name__ == "__main__":
    # TEST BLOCK
    image_file = "landmark.jpg"
    # Example coordinates (e.g., Eiffel Tower area)
    test_long = 2.2945
    test_lat = 48.8584

    print("--- Starting Place Recognition Test with Coordinates ---")
    
    if os.path.exists(image_file):
        result_text = recognize_landmark(image_file, test_long, test_lat)
        print(f"\n{result_text}")
    else:
        # Check if it's in the Gemini folder specifically if run from root
        alt_path = os.path.join("Gemini", image_file)
        if os.path.exists(alt_path):
            result_text = recognize_landmark(alt_path, test_long, test_lat)
            print(f"\n{result_text}")
        else:
            print(f"\n[!] Please place an image named '{image_file}' in the backend/ or Gemini/ folder to test.")
            print(f"    Current working directory: {os.getcwd()}")
