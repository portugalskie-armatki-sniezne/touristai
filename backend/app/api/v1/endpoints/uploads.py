import os
import tempfile
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from Gemini.Place_Recognition import recognize_landmark

router = APIRouter()

@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    mag: float = Form(..., description="Latitude/Magnitude of where the photo was taken"),
    long: float = Form(..., description="Longitude of where the photo was taken")
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    tmp_path = None
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(image.file, tmp)
            tmp_path = tmp.name

        building_info = recognize_landmark(tmp_path, long, mag)
        
        return {
            "building_info": building_info,
            "coordinates": {"mag": mag, "long": long},
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
