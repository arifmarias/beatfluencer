from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
import shutil
from enum import Enum
import cloudinary
import cloudinary.uploader
import cloudinary.api

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="Beatfluencer API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    CAMPAIGN_MANAGER = "campaign_manager"
    INFLUENCER_MANAGER = "influencer_manager"

class AccountType(str, Enum):
    PERSONAL = "personal"
    BUSINESS = "business"
    CREATOR = "creator"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHERS = "others"

class CampaignStatus(str, Enum):
    INITIATED = "initiated"
    STARTED = "started"
    ONGOING = "ongoing"
    ENDED = "ended"

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    role: UserRole
    password_hash: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class SocialMediaAccount(BaseModel):
    platform: str
    channel_name: str
    url: str
    follower_count: int
    verification_status: bool
    cpv: Optional[float] = 0.0
    created_year: int
    created_month: int

class SuccessfulCampaign(BaseModel):
    title: str
    link: str
    metrics: str
    media_url: Optional[str] = None

class RemunerationService(BaseModel):
    service_name: str
    rate: float

class DedicatedBrand(BaseModel):
    name: str
    logo_url: Optional[str] = None

class Influencer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Personal Information
    account_type: AccountType
    name: str
    email: EmailStr
    phone: str
    address: str
    division: str
    gender: Gender
    date_of_birth: datetime
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    
    # Influencer Categories
    categories: List[str] = []
    
    # Remuneration
    remuneration_services: List[RemunerationService] = []
    
    # Experience
    experience_years: str  # "0-1", "1-3", "3-5", "5+"
    total_campaigns: int = 0
    affiliated_brands: List[str] = []  # comma-separated brands as chips
    dedicated_brands: List[DedicatedBrand] = []
    successful_campaigns: List[SuccessfulCampaign] = []
    industries_worked: List[str] = []
    
    # Payment Information
    beneficiary_name: Optional[str] = None
    account_number: Optional[str] = None
    tin_number: Optional[str] = None
    bank_name: Optional[str] = None
    
    # Featured Options
    featured_category: bool = False
    featured_creators: bool = False
    
    # Social Media
    social_media_accounts: List[SocialMediaAccount] = []
    
    # System fields
    verification_status: bool = False
    status: str = "active"  # active, inactive, pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InfluencerCreate(BaseModel):
    # Personal Information
    account_type: AccountType
    name: str
    email: EmailStr
    phone: str
    address: str
    division: str
    gender: Gender
    date_of_birth: datetime
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    
    # Categories
    categories: List[str] = []
    
    # Remuneration
    remuneration_services: List[RemunerationService] = []
    
    # Experience
    experience_years: str
    total_campaigns: int = 0
    affiliated_brands: List[str] = []
    dedicated_brands: List[DedicatedBrand] = []
    successful_campaigns: List[SuccessfulCampaign] = []
    industries_worked: List[str] = []
    
    # Payment Information
    beneficiary_name: Optional[str] = None
    account_number: Optional[str] = None
    tin_number: Optional[str] = None
    bank_name: Optional[str] = None
    
    # Featured Options
    featured_category: bool = False
    featured_creators: bool = False
    
    # Social Media
    social_media_accounts: List[SocialMediaAccount] = []
    phone: str
    address: str
    division: str
    gender: Gender
    date_of_birth: datetime
    bio: Optional[str] = None
    categories: List[str] = []
    remuneration_services: List[RemunerationService] = []
    experience_years: str
    total_campaigns: int = 0
    affiliated_brands: List[str] = []
    dedicated_brands: List[DedicatedBrand] = []
    industries_worked: List[str] = []
    beneficiary_name: Optional[str] = None
    account_number: Optional[str] = None
    tin_number: Optional[str] = None
    bank_name: Optional[str] = None
    featured_category: bool = False
    featured_creators: bool = False
    social_media_accounts: List[SocialMediaAccount] = []
    status: str = "draft"

class Brand(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    legal_name: str
    logo_url: Optional[str] = None
    industry: str
    nature_of_business: str
    address: str
    website: Optional[str] = None
    social_media_links: Dict[str, str] = {}
    contact_persons: List[Dict[str, str]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrandCreate(BaseModel):
    legal_name: str
    industry: str
    nature_of_business: str
    address: str
    website: Optional[str] = None
    social_media_links: Dict[str, str] = {}
    contact_persons: List[Dict[str, str]] = []

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    campaign_name: str
    start_date: datetime
    end_date: datetime
    budget: float
    brief: str
    status: CampaignStatus
    responsible_person_id: str
    work_order_attachment: Optional[str] = None
    supporting_files: List[str] = []
    influencer_ids: List[str] = []
    client_manager: Dict[str, str] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CampaignCreate(BaseModel):
    brand_id: str
    campaign_name: str
    start_date: datetime
    end_date: datetime
    budget: float
    brief: str
    status: CampaignStatus
    responsible_person_id: str
    influencer_ids: List[str] = []
    client_manager: Dict[str, str] = {}

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

def require_role(allowed_roles: List[UserRole]):
    def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_dependency

# Auth Routes
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_dict["password_hash"] = hashed_password
    user_obj = User(**user_dict)
    
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await db.users.update_one(
        {"email": user_credentials.email},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    return {"access_token": access_token, "token_type": "bearer", "user": user_obj}

@api_router.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# User Management Routes
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

# Influencer Routes
@api_router.post("/influencers", response_model=Influencer)
async def create_influencer(
    influencer_data: InfluencerCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.INFLUENCER_MANAGER]))
):
    # Check if email already exists
    existing = await db.influencers.find_one({"email": influencer_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    influencer_obj = Influencer(**influencer_data.dict())
    await db.influencers.insert_one(influencer_obj.dict())
    return influencer_obj

@api_router.get("/influencers/check-url")
async def check_url_exists(
    url: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.INFLUENCER_MANAGER]))
):
    """Check if a social media URL already exists in the database"""
    existing = await db.influencers.find_one({
        "social_media_accounts.url": url.strip()
    })
    return {"exists": bool(existing)}

@api_router.get("/influencers", response_model=List[Influencer])
async def get_influencers(
    status: Optional[str] = None,
    category: Optional[str] = None,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    if category:
        query["categories"] = {"$in": [category]}
    
    influencers = await db.influencers.find(query).to_list(1000)
    
    # Role-based data filtering
    filtered_influencers = []
    for inf in influencers:
        influencer_obj = Influencer(**inf)
        if current_user.role == UserRole.CAMPAIGN_MANAGER:
            # Remove sensitive data for campaign managers
            influencer_obj.remuneration_services = []
            influencer_obj.phone = ""
            influencer_obj.email = ""
            influencer_obj.beneficiary_name = None
            influencer_obj.account_number = None
            influencer_obj.tin_number = None
            influencer_obj.bank_name = None
        filtered_influencers.append(influencer_obj)
    
    return filtered_influencers

@api_router.get("/influencers/{influencer_id}", response_model=Influencer)
async def get_influencer(
    influencer_id: str,
    current_user: User = Depends(get_current_user)
):
    influencer = await db.influencers.find_one({"id": influencer_id})
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    influencer_obj = Influencer(**influencer)
    
    # Role-based data filtering
    if current_user.role == UserRole.CAMPAIGN_MANAGER:
        influencer_obj.remuneration_services = []
        influencer_obj.phone = ""
        influencer_obj.email = ""
        influencer_obj.beneficiary_name = None
        influencer_obj.account_number = None
        influencer_obj.tin_number = None
        influencer_obj.bank_name = None
    
    return influencer_obj

# Brand Routes
@api_router.post("/brands", response_model=Brand)
async def create_brand(
    brand_data: BrandCreate,
    current_user: User = Depends(get_current_user)
):
    brand_obj = Brand(**brand_data.dict())
    await db.brands.insert_one(brand_obj.dict())
    return brand_obj

@api_router.get("/brands", response_model=List[Brand])
async def get_brands(current_user: User = Depends(get_current_user)):
    brands = await db.brands.find().to_list(1000)
    return [Brand(**brand) for brand in brands]

# Campaign Routes
@api_router.post("/campaigns", response_model=Campaign)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_user)
):
    campaign_obj = Campaign(**campaign_data.dict())
    await db.campaigns.insert_one(campaign_obj.dict())
    return campaign_obj

@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns(current_user: User = Depends(get_current_user)):
    campaigns = await db.campaigns.find().to_list(1000)
    return [Campaign(**campaign) for campaign in campaigns]

# File Upload Routes
@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Create unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": unique_filename, "url": f"/uploads/{unique_filename}"}

# Search Routes
@api_router.get("/search/influencers", response_model=List[Influencer])
async def search_influencers(
    q: Optional[str] = None,
    platform: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    division: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {"status": "published"}
    
    # Text search
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"bio": {"$regex": q, "$options": "i"}},
            {"categories": {"$regex": q, "$options": "i"}},
            {"affiliated_brands": {"$regex": q, "$options": "i"}}
        ]
    
    # Filters
    if category:
        query["categories"] = {"$in": [category]}
    if gender:
        query["gender"] = gender
    if division:
        query["division"] = division
    
    # Age filter
    if min_age or max_age:
        age_query = {}
        if min_age:
            age_query["$lte"] = datetime.now(timezone.utc) - timedelta(days=min_age*365)
        if max_age:
            age_query["$gte"] = datetime.now(timezone.utc) - timedelta(days=max_age*365)
        if age_query:
            query["date_of_birth"] = age_query
    
    influencers = await db.influencers.find(query).to_list(100)
    
    # Filter by platform and followers
    filtered_influencers = []
    for inf in influencers:
        influencer_obj = Influencer(**inf)
        
        # Platform and follower filtering
        if platform or min_followers or max_followers:
            matching_accounts = []
            for account in influencer_obj.social_media_accounts:
                if platform and account.platform.lower() != platform.lower():
                    continue
                if min_followers and account.follower_count < min_followers:
                    continue
                if max_followers and account.follower_count > max_followers:
                    continue
                matching_accounts.append(account)
            
            if not matching_accounts:
                continue
        
        # Role-based data filtering
        if current_user.role == UserRole.CAMPAIGN_MANAGER:
            influencer_obj.remuneration_services = []
            influencer_obj.phone = ""
            influencer_obj.email = ""
            influencer_obj.beneficiary_name = None
            influencer_obj.account_number = None
            influencer_obj.tin_number = None
            influencer_obj.bank_name = None
        
        filtered_influencers.append(influencer_obj)
    
    return filtered_influencers

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database with default users and demo data"""
    try:
        # Create default admin user if not exists
        admin_email = "admin@beatfluencer.com"
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if not existing_admin:
            admin_user = User(
                username="admin",
                email=admin_email,
                role=UserRole.ADMIN,
                password_hash=get_password_hash("admin123")
            )
            await db.users.insert_one(admin_user.dict())
            logger.info("Created default admin user")
        
        # Create demo campaign manager if not exists
        cm_email = "cm_new@test.com"
        existing_cm = await db.users.find_one({"email": cm_email})
        
        if not existing_cm:
            cm_user = User(
                username="Campaign Manager",
                email=cm_email,
                role=UserRole.CAMPAIGN_MANAGER,
                password_hash=get_password_hash("cm123")
            )
            await db.users.insert_one(cm_user.dict())
            logger.info("Created demo campaign manager user")
            
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()