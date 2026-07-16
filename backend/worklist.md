Following the work of the Tags for a post . Now its time to work on the 
Forget password . 

I'm using the Resend API. Help me add this code to my project.

Ask the user to replace `re_xxxxxxxxx` with their real API key.

```python
import resend

resend.api_key = "re_xxxxxxxxx"

r = resend.Emails.send({
  "from": "onboarding@resend.dev",
  "to": "abirzayn561@gmail.com",
  "subject": "Hello World",
  "html": "<p>Congrats on sending your <strong>first email</strong>!</p>"
})

```