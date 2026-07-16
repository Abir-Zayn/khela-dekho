import resend
from app.config import settings

resend.api_key = settings.RESEND_API_KEY

def send_reset_email(to_email:str, reset_token:str)-> None:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    html_content = f"""
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to create a new password:</p>
    <p><a href="{reset_link}">Reset Password</a></p>
    <p>If you did not request this, please ignore this email.</p>
    """

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": to_email,
            "subject": "Password Reset Request",
            "html": html_content,
        })
    except Exception as e:
        print(f"Error sending reset email: {e}")