import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv(".env.local")

app = FastAPI()


class EmailRequest(BaseModel):
    api_key: str
    to: str
    subject: str
    html: str


@app.get("/")
def root():
    return {"service": "HealthCopilot Email Service"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/send-email")
def send_email(request: EmailRequest):

    if request.api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API Key")

    msg = EmailMessage()

    msg["Subject"] = request.subject
    msg["From"] = os.getenv("SMTP_USERNAME")
    msg["To"] = request.to

    msg.set_content(
        "Please use an HTML-compatible email client."
    )

    msg.add_alternative(
        request.html,
        subtype="html",
    )

    try:
        with smtplib.SMTP(
            os.getenv("SMTP_HOST"),
            int(os.getenv("SMTP_PORT"))
        ) as smtp:

            smtp.starttls()

            smtp.login(
                os.getenv("SMTP_USERNAME"),
                os.getenv("SMTP_PASSWORD"),
            )

            smtp.send_message(msg)

        return {
            "success": True,
            "message": "Email sent successfully",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )