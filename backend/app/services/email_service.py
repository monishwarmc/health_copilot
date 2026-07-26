from email.message import EmailMessage
import smtplib
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

from app.exceptions.auth import EmailDeliveryException

from datetime import datetime

from app.core.logging import logger

TEMPLATE_DIR = (
    Path(__file__)
    .resolve()
    .parent.parent
    / "templates"
    / "emails"
)

jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
)


class EmailService:

    def _render_template(
        self,
        template_name: str,
        **context,
    ) -> str:
        context.setdefault("app_name", "Health Copilot")
        context.setdefault("year", datetime.now().year)

        template = jinja_env.get_template(template_name)
        return template.render(**context)
    
    def send_verification_email(
        self,
        to_email: str,
        full_name: str,
        verification_url: str,
    )-> None:
        html = self._render_template(
            "verify_email.html",
            name=full_name,
            verification_url=verification_url,
        )

        self._send_email(
            to_email=to_email,
            subject="Verify your Health Copilot account",
            html=html,
        )

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html: str,
    ) -> None:
        message = EmailMessage()

        message["Subject"] = subject
        message["From"] = (
            f"{settings.SMTP_FROM_NAME} "
            f"<{settings.SMTP_FROM}>"
        )
        message["To"] = to_email

        # Plain text fallback
        message.set_content(
            "Please use an HTML-compatible email client."
        )

        # HTML content
        message.add_alternative(
            html,
            subtype="html",
        )

        try:
            with smtplib.SMTP(
                settings.SMTP_HOST,
                settings.SMTP_PORT,
            ) as smtp:

                smtp.starttls()

                smtp.login(
                    settings.SMTP_USERNAME,
                    settings.SMTP_PASSWORD,
                )

                smtp.send_message(message)

            logger.info(
                "Email sent successfully to %s",
                to_email,
            )

        except Exception as e:
            logger.exception(
                "Failed to send email to %s",
                to_email,
            )
            raise EmailDeliveryException() from e


email_service = EmailService()