from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Riftbound API"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str
    SUPABASE_JWT_SECRET: str
    
    class Config:
        env_file = ".env"

settings = Settings()
