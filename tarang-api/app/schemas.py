from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
import re
import datetime

class ScreeningBase(BaseModel):
    video_metrics: Dict[str, Any]
    questionnaire_score: int = Field(..., ge=0, le=100)
    patient_name: str = Field(..., min_length=2, max_length=100)

    @validator("patient_name")
    def sanitize_name(cls, v):
        return re.sub(r"[^\w\s-]", "", v).strip()

class CommunityPostCreate(BaseModel):
    author: str = Field(..., min_length=2, max_length=50)
    content: str = Field(..., min_length=1, max_length=1000)

class AppointmentSchedule(BaseModel):
    patient_id: str
    specialist_id: str
    timeslot: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    org_id: Optional[int] = None

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "parent"
    org_license: Optional[str] = None
    profile_metadata: Optional[Dict[str, Any]] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    org_id: Optional[int]
    profile_metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class OrganizationCreate(BaseModel):
    name: str
    license_key: str

class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2)
    external_id: str
    date_of_birth: datetime.datetime
    phone: Optional[str] = None
    address: Optional[str] = None

class TherapyProgressBase(BaseModel):
    social_engagement: float = Field(..., ge=0, le=1)
    joint_attention: float = Field(..., ge=0, le=1)
    focus_drift: float = Field(..., ge=0, le=1)
    notes: Optional[str] = None

class TherapyProgressCreate(TherapyProgressBase):
    patient_id: int
    session_id: Optional[int] = None

class TherapyProgressOut(TherapyProgressBase):
    id: int
    patient_id: int
    session_id: Optional[int]
    timestamp: datetime.datetime

    class Config:
        from_attributes = True
