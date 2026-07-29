from fastapi import FastAPI

from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)