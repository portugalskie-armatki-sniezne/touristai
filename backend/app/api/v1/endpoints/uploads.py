import os
import tempfile
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from Gemini.Place_Recognition import recognize_landmark, format_place_info, get_city_transport_info, compile_preferences

router = APIRouter()

@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    mag: float = Form(..., description="Latitude/Magnitude of where the photo was taken"),
    long: float = Form(..., description="Longitude of where the photo was taken"),
    preferences: str = Form(None, description="Optional JSON string containing user preferences"),
    preferred_language: str = Form("English", description="The language in which all data should be returned.")
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    tmp_path = None
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(image.file, tmp)
            tmp_path = tmp.name

        compiled_prefs = compile_preferences(preferred_language, preferences)
        raw_data = recognize_landmark(tmp_path, long, mag, compiled_prefs)
        formatted_info = format_place_info(raw_data, compiled_prefs)
        
        return {
            "Building info": formatted_info,
            "raw_data": raw_data,
            "long": long,
            "mag": mag,
            "Street": raw_data.get("street", ""),
            "Region": raw_data.get("region", ""),
            "Country": raw_data.get("country", ""),
            "Building name": raw_data.get("name", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.get("/transport")
async def get_transport_info(
    city: str = Query(..., description="The city name"),
    country: str = Query(..., description="The country name"),
    preferred_language: str = Query("English", description="The language in which all data should be returned.")
):
    """
    Fetches practical information and useful links for public transportation
    in the specified city and country.
    """
    try:
        compiled_prefs = compile_preferences(preferred_language)
        transport_data = get_city_transport_info(city, country, compiled_prefs)
        if "error" in transport_data:
            raise HTTPException(status_code=500, detail=transport_data["error"])
            
        return {
            "city": city,
            "country": country,
            "transport_info": transport_data.get("transport_info", ""),
            "useful_links": transport_data.get("useful_links", []),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transport info: {str(e)}")
