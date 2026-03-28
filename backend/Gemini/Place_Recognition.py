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
    tour_guide_description: str = Field(description="The 200-300-word 'Tour Guide' style narrative and historical fact")
    is_landmark: bool = Field(description="True if it is a well-known landmark, False otherwise")
    is_restaurant_or_hotel: bool = Field(description="True if it is a restaurant, cafe, or hotel")
    internet_opinions: str = Field(description="If restaurant/hotel, summarize internet opinions and reviews. Otherwise empty string.")
    booking_or_menu_link: str = Field(description="If restaurant/hotel, provide a link to the menu or booking site. Otherwise empty string.")

def recognize_landmark(image_path: str, long: float, lat: float, preferences_json: str = None) -> dict:
    """
    Identifies a landmark from an image path and coordinates using Gemini Flash.
    Returns the raw JSON data of the recognized object as a dictionary.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')

    try:
        if not os.path.exists(image_path):
            return {"error": f"File not found at {image_path}"}

        sample_file = PIL.Image.open(image_path)

        prompt = (
            "You are an expert virtual tour guide giving a world tour. Your tone is engaging, "
            "knowledgeable, and witty. You specialize in connecting visual landmarks with "
            "geographic and historical context. "
            f"Identify the building or place in this image. "
            f"The image was taken near coordinates: longitude {long}, latitude {lat}. "
            "\nTasks:\n"
            "1. Identify the name, city, and country of the place.\n"
            "2. Provide a 'Tour Guide' style description with one fascinating historical fact it should be 200-300 words long.\n"
            "3. Make it an interesting narrative for the reader.\n"
            "4. If the specific building is not a famous landmark or is unknown:\n"
            "   - Identify the architectural style and distinguishing features of the area.\n"
            "   - Provide information about the broader region.\n"
            "   - Mention 2-3 other famous landmarks in the surrounding vicinity to provide context.\n"
            "5. If the place is a restaurant or hotel, fetch/summarize internet opinions and provide a link to the menu or booking site."
        )

        if preferences_json:
            try:
                prefs = json.loads(preferences_json)
                prefs_str = ", ".join(f"{k}: {v}" for k, v in prefs.items())
                prompt += f"\n\nIMPORTANT: Tailor your response and description based on these user preferences: {prefs_str}."
            except Exception:
                pass

        # Using structured output for internal consistency
        response = model.generate_content(
            [prompt, sample_file],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=PlaceInfo
            )
        )

        if response and response.text:
            return json.loads(response.text)
        
        return {"error": "The place could not be identified."}

    except Exception as e:
        return {"error": f"Error during recognition: {str(e)}"}

def format_place_info(raw_data: dict, preferences_json: str = None) -> str:
    """
    Formats the raw dictionary data from recognize_landmark into a user-friendly string.
    """
    if "error" in raw_data:
        return raw_data["error"]
        
    name = raw_data.get("name", "Unknown Place")
    city = raw_data.get("city", "Unknown City")
    country = raw_data.get("country", "Unknown Country")
    desc = raw_data.get("tour_guide_description", "")
    
    # Default formatting
    output = (
        f"🌟 Recognized Object: {name}\n"
        f"📍 Location: {city}, {country}\n\n"
        f"📖 Virtual Tour:\n{desc}"
    )
    
    if raw_data.get("is_restaurant_or_hotel"):
        opinions = raw_data.get("internet_opinions", "")
        link = raw_data.get("booking_or_menu_link", "")
        if opinions:
            output += f"\n\n🍽️ Internet Opinions:\n{opinions}"
        if link:
            output += f"\n\n🔗 Booking/Menu Link: {link}"
    
    if preferences_json:
        try:
            prefs = json.loads(preferences_json)
            if prefs.get("format", "").lower() == "json":
                return json.dumps(raw_data, indent=2)
            elif prefs.get("format", "").lower() == "markdown":
                output = f"## 🌟 {name}\n**📍 Location:** {city}, {country}\n\n### 📖 Virtual Tour:\n{desc}"
                if raw_data.get("is_restaurant_or_hotel"):
                    if raw_data.get("internet_opinions"):
                        output += f"\n\n### 🍽️ Internet Opinions:\n{raw_data.get('internet_opinions')}"
                    if raw_data.get("booking_or_menu_link"):
                        output += f"\n\n### 🔗 Booking/Menu Link:\n[{raw_data.get('booking_or_menu_link')}]({raw_data.get('booking_or_menu_link')})"
            elif prefs.get("short_version"):
                output = f"{name} ({city}, {country})"
        except Exception:
            pass
            
    return output

def get_city_transport_info(city: str, country: str) -> dict:
    """
    Takes a city and country and returns useful links and practical information 
    for accessing subway or bus stations.
    """
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    class TransportInfo(BaseModel):
        transport_info: str = Field(description="Practical information about navigating the city's public transit")
        useful_links: list[str] = Field(description="List of useful URLs for official transit maps or authorities")
        
    prompt = (
        f"Provide practical and useful information for navigating public transportation in {city}, {country}. "
        "Include details on how to access subway or bus stations, types of tickets, and provide useful official links "
        "for maps or transport authorities."
    )
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=TransportInfo
            )
        )
        if response and response.text:
            return json.loads(response.text)
        return {"error": "Could not fetch transport information."}
    except Exception as e:
        return {"error": f"Error fetching transport info: {str(e)}"}

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
