#!/usr/bin/env python3
"""Generate bcrypt password hash for admin user"""
import bcrypt

password = "Aintrix@111!"
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password_bytes, salt)

print(f"Password: {password}")
print(f"Bcrypt Hash: {hashed.decode('utf-8')}")
