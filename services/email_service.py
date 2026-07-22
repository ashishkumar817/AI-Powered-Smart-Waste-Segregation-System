from flask_mail import Mail, Message
from flask import render_template

mail = Mail()


def send_email(recipient, subject, body=None, html_template=None, **kwargs):
    """
    Generic email sender.

    Parameters:
    recipient      -> Receiver email
    subject        -> Email subject
    body           -> Plain text body (optional)
    html_template  -> HTML template filename (optional)
    kwargs         -> Variables passed to HTML template
    """

    msg = Message(
        subject=subject,
        recipients=[recipient]
    )

    # Plain text email
    if body:
        msg.body = body

    # HTML email
    if html_template:
        msg.html = render_template(html_template, **kwargs)

    mail.send(msg)