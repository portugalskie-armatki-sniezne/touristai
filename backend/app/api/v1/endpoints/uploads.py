from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter()

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    lat: float = Form(..., description="Latitude of where the photo was taken"),
    lng: float = Form(..., description="Longitude of where the photo was taken")
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    return {
        "filename": file.filename,
        "coordinates": {"lat": lat, "lng": lng},
        "status": "processing",
        "message": f"Analyzing photo at {lat}, {lng}"
    }
