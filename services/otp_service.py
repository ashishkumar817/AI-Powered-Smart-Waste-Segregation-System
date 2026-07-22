import secrets


def generate_otp():
    """
    Generates a secure 6-digit OTP.
    """
    return str(secrets.randbelow(900000) + 100000)