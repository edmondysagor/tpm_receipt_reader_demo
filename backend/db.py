import os
import logging
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

def get_database_url():
    return os.getenv("DATABASE_PUBLIC_URL") or os.getenv("DATABASE_URL", "")

def get_connection():
    db_url = get_database_url()
    if not db_url:
        raise ValueError("DATABASE_URL / DATABASE_PUBLIC_URL environment variable is not set")
    return psycopg2.connect(db_url)

def init_db():
    """Create users and user_credits tables if they do not exist."""
    db_url = get_database_url()
    if not db_url:
        logger.warning("DATABASE_URL is not set. Skipping database initialization.")
        return

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(64) PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        full_name VARCHAR(255),
                        password_hash VARCHAR(255),
                        auth_provider VARCHAR(50) DEFAULT 'local',
                        avatar_url TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS user_credits (
                        id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                        credits_balance INTEGER DEFAULT 10 NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                """)
                conn.commit()
                logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (email.strip(),))
            return cur.fetchone()

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cur.fetchone()

def create_user(
    email: str,
    password_hash: Optional[str] = None,
    full_name: Optional[str] = None,
    auth_provider: str = 'local',
    avatar_url: Optional[str] = None,
    starting_credits: int = 10
) -> Dict[str, Any]:
    user_id = str(uuid.uuid4())
    clean_email = email.strip().lower()

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO users (id, email, full_name, password_hash, auth_provider, avatar_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *;
            """, (user_id, clean_email, full_name, password_hash, auth_provider, avatar_url))
            user = cur.fetchone()

            cur.execute("""
                INSERT INTO user_credits (id, credits_balance)
                VALUES (%s, %s)
                ON CONFLICT (id) DO NOTHING;
            """, (user_id, starting_credits))
            conn.commit()
            return user

def update_user_profile(user_id: str, full_name: Optional[str] = None, avatar_url: Optional[str] = None):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE users
                SET full_name = COALESCE(%s, full_name),
                    avatar_url = COALESCE(%s, avatar_url),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *;
            """, (full_name, avatar_url, user_id))
            conn.commit()
            return cur.fetchone()

def get_credits(user_id: str) -> int:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT credits_balance FROM user_credits WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if row:
                return row["credits_balance"]
            # Auto-create entry with 10 default credits if missing
            cur.execute("""
                INSERT INTO user_credits (id, credits_balance)
                VALUES (%s, 10)
                ON CONFLICT (id) DO NOTHING
                RETURNING credits_balance;
            """, (user_id,))
            conn.commit()
            new_row = cur.fetchone()
            return new_row["credits_balance"] if new_row else 10

def decrement_credits(user_id: str, amount: int) -> int:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE user_credits
                SET credits_balance = GREATEST(0, credits_balance - %s),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING credits_balance;
            """, (amount, user_id))
            conn.commit()
            row = cur.fetchone()
            return row["credits_balance"] if row else 0

def increment_credits(user_id: str, amount: int) -> int:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO user_credits (id, credits_balance)
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE
                SET credits_balance = user_credits.credits_balance + %s,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING credits_balance;
            """, (user_id, amount, amount))
            conn.commit()
            row = cur.fetchone()
            return row["credits_balance"] if row else amount
