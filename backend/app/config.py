from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL:str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET_NAME: str

    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    FRONTEND_URL: str = "http://localhost:3000"
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: str = "http://localhost:3000"
    FOOTBALL_DATA_API_KEY: str = ""
    CRICKET_DATA_API_KEY: str = ""
    THESPORTSDB_API_KEY: str = "3"

    # Clerk Authentication Configuration
    CLERK_ISSUER_URL: str = ""
    CLERK_SECRET_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""

    class Config:
        env_file = ".env"
       

settings = Settings()  # type: ignore

    

