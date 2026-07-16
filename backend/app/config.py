from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL:str

    SECRET_KEY: str="CHANGE_ME"
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

    class Config:
        env_file = ".env"
       

settings = Settings()

    

