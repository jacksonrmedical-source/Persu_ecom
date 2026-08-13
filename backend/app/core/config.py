from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str  # server-side key, never exposed to frontend
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    ADMIN_SECRET: str = ""  # shared password for the admin product form
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "https://trendloot.vercel.app",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
