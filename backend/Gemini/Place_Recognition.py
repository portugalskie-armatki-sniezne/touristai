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
    street: str = Field(description="The street name where the place is located")
    city: str = Field(description="The city where the place is located")
    region: str = Field(description="The state, province, or region where the place is located")
    country: str = Field(description="The country where the place is located")
    tour_guide_description: list[str] = Field(description="Objective, factual description points to make it easy to read. Must include estimated average rating (e.g. 4.5/5) and average price level if applicable.")
    is_landmark: bool = Field(description="True if it is a well-known landmark, False otherwise")
    is_restaurant_or_hotel: bool = Field(description="True if it is a restaurant, cafe, or hotel")
    internet_opinions: str = Field(description="If restaurant/hotel, summarize internet opinions and reviews. Otherwise empty string.")
    booking_or_menu_link: str = Field(description="If restaurant/hotel, provide a link to the menu or booking site. Otherwise empty string.")

def compile_preferences(preferred_language: str, preferences_json: str = None) -> str:
    """
    Merges preferred_language and preferences_json into a unified preferences JSON string.
    """
    prefs = {"preferred_language": preferred_language}
    if preferences_json:
        try:
            user_prefs = json.loads(preferences_json)
            if isinstance(user_prefs, dict):
                prefs.update(user_prefs)
        except Exception:
            pass
    return json.dumps(prefs, ensure_ascii=False)

def recognize_landmark(image_path: str, long: float, lat: float, preferences_json: str = None) -> dict:
    """
    Identifies a landmark from an image path and coordinates using Gemini Flash.
    Returns the raw JSON data of the recognized object as a dictionary.
    """
    model = genai.GenerativeModel('gemini-3-flash-preview')

    try:
        if not os.path.exists(image_path):
            return {"error": f"File not found at {image_path}"}

        sample_file = PIL.Image.open(image_path)
        prompt = (
            "You are an objective, highly factual travel assistant. Your tone is neutral and informative, not overly enthusiastic. "
            f"Make sure you fulfil user preferences: {preferences_json}. "
            "You specialize in identifying visual landmarks and providing objective geographic context. As an expert do not be afraid to admit you do not know. Do not hallucinate. "
            f"Identify the building or place in this image. "
            f"The image was taken near coordinates: longitude {long}, latitude {lat}. "
            "CRITICAL REQUIREMENT: Heavy emphasis must be placed on analyzing the provided longitude and latitude to correctly deduce the location in the first stage.\n"
            "\nTasks:\n"
            "1. Identify the name, street, city, region, and country of the place.\n"
            "2. Provide an objective, factual description as a list of distinct points. You MUST include the estimated average rating (x/5) and average price level or cost in these points.\n"
            "3. Provide raw non-formatted location data about this landmark.\n"
            "4. If the specific building is not a famous landmark or is unknown or you are not sure:\n"
            "   - Identify the architectural style and distinguishing features of the area.\n"
            "   - Provide information about the broader region.\n"
            "   - Mention 2-3 other famous landmarks in the surrounding vicinity to provide context.\n"
            "5. If the place is a restaurant or hotel, fetch/summarize internet opinions and provide a link to the menu or booking site.\n\n"
        )

        # Using structured output for internal consistency
        response = model.generate_content(
            [prompt, sample_file],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=PlaceInfo
            )
        )

        if response and response.text:
            raw_data = json.loads(response.text)
            
            if raw_data.get("is_restaurant_or_hotel"):
                name = raw_data.get("name", "Unknown Name")
                city = raw_data.get("city", "Unknown City")
                country = raw_data.get("country", "Unknown Country")
                
                class RestaurantSearch(BaseModel):
                    internet_opinions: str = Field(description="Summarized internet opinions and reviews")
                    booking_or_menu_link: str = Field(description="Link to the booking site or menu")
                    
                prompt2 = (
                    f"Search for the restaurant or hotel named '{name}' in {city}, {country}. "
                    "Summarize its internet reviews and opinions, and provide a URL to its menu or booking site.\n"
                    f"CRITICAL REQUIREMENT: Make sure you fulfil user preferences: {preferences_json}"
                )
                try:
                    res2 = model.generate_content(
                        prompt2,
                        generation_config=genai.GenerationConfig(
                            response_mime_type="application/json",
                            response_schema=RestaurantSearch
                        )
                    )
                    if res2 and res2.text:
                        extra_data = json.loads(res2.text)
                        raw_data["internet_opinions"] = extra_data.get("internet_opinions", "")
                        raw_data["booking_or_menu_link"] = extra_data.get("booking_or_menu_link", "")
                except Exception:
                    pass
                    
            return raw_data
        
        return {"error": "The place could not be identified."}

    except Exception as e:
        return {"error": f"Error during recognition: {str(e)}"}

def format_landmark_info(raw_data: dict, preferences_json: str = None) -> str:
    """
    Formats the raw dictionary data specifically for landmarks.
    """
    if "error" in raw_data:
        return raw_data["error"]
        
    if preferences_json:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                f"You are a helpful travel assistant. Format the following landmark information. "
                f"Make sure you write the answer in the preferred language specified in the preferences. "
                f"Make the description dynamic, readable, and creatively adapted to these exact user preferences: {preferences_json}. "
                f"Feel free to use bullet points where it makes sense to improve readability.\n\n"
                f"Landmark Data: {json.dumps(raw_data, ensure_ascii=False)}"
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception:
            pass
            
    name = raw_data.get("name", "Unknown Place")
    city = raw_data.get("city", "Unknown City")
    country = raw_data.get("country", "Unknown Country")
    desc_raw = raw_data.get("tour_guide_description", [])
    if isinstance(desc_raw, list):
        desc = "\n".join(f"- {d}" for d in desc_raw)
    else:
        desc = str(desc_raw)
    
    output = (
        f"Recognized Object: {name}\n"
        f"Location: {city}, {country}\n\n"
        f"Virtual Tour:\n{desc}"
    )
            
    return output

def format_restaurant_info(raw_data: dict, preferences_json: str = None) -> str:
    """
    Formats raw dictionary data specifically for restaurants and hotels.
    """
    if "error" in raw_data:
        return raw_data["error"]
        
    if preferences_json:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                f"You are a helpful travel assistant. Format the following restaurant/hotel information. "
                f"Make sure you write the answer in the preferred language specified in the preferences. "
                f"Make the description dynamic, readable, and creatively adapted to these exact user preferences: {preferences_json}. "
                f"Feel free to use bullet points where it makes sense to improve readability.\n\n"
                f"Make sure to include information about internet opinions and booking links from the Data.\n\n"
                f"Data: {json.dumps(raw_data, ensure_ascii=False)}"
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception:
            pass
            
    name = raw_data.get("name", "Unknown Restaurant or Hotel")
    city = raw_data.get("city", "Unknown City")
    country = raw_data.get("country", "Unknown Country")
    desc_raw = raw_data.get("tour_guide_description", [])
    if isinstance(desc_raw, list):
        desc = "\n".join(f"- {d}" for d in desc_raw)
    else:
        desc = str(desc_raw)
    opinions = raw_data.get("internet_opinions", "")
    link = raw_data.get("booking_or_menu_link", "")
    
    output = (
        f"Recognized Object: {name}\n"
        f"Location: {city}, {country}\n\n"
        f"Description:\n{desc}"
    )
    
    if opinions:
        output += f"\n\nInternet Opinions:\n{opinions}"
    if link:
        output += f"\n\nBooking/Menu Link: {link}"
            
    return output

def format_place_info(raw_data: dict, preferences_json: str = None) -> str:
    """
    Routes to the correct formatting function based on place type.
    """
    if raw_data.get("is_restaurant_or_hotel"):
        return format_restaurant_info(raw_data, preferences_json)
    return format_landmark_info(raw_data, preferences_json)

def get_city_transport_info(city: str, country: str, preferences_json: str = None) -> dict:
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
        f"\nCRITICAL REQUIREMENT: Make sure you fulfil user preferences: {preferences_json}"
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
