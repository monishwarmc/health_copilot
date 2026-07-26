from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    DEBUG: bool

    API_PREFIX: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    DATABASE_URL: str

    FRONTEND_URL: str
    
    GOOGLE_CLIENT_ID: str
    
    EMAIL_VERIFY_EXPIRE_MINUTES: int
    
    SMTP_HOST: str
    
    SMTP_PORT: int
    
    SMTP_USERNAME: str
    
    SMTP_PASSWORD: str
    
    SMTP_FROM: str
    
    SMTP_FROM_NAME: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()