from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.weight import router as weight_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(weight_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"backend"  : "Health copilot"}