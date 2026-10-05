import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import auth
import db

def test_auth():
    print("Testing password hashing...")
    pw = "mySecretPassword123"
    hashed = auth.hash_password(pw)
    assert auth.verify_password(pw, hashed)
    assert not auth.verify_password("wrongpassword", hashed)
    print("✓ Password hashing works!")

    print("Testing JWT token generation and decoding...")
    token = auth.create_access_token("test-user-id", "test@example.com", "Test User")
    decoded = auth.decode_access_token(token)
    assert decoded["sub"] == "test-user-id"
    assert decoded["email"] == "test@example.com"
    print("✓ JWT creation & verification works!")

if __name__ == "__main__":
    test_auth()
    print("All auth tests passed!")
