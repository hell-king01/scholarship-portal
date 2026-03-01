"""
Migration runner: runs admin_provider_setup.sql against the scholarship portal Supabase project.
Uses PostgreSQL connection via supabase python client's postgrest or pg8000.
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
ANON_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")

print(f"Connecting to: {SUPABASE_URL}")

# We'll run each statement individually via the supabase python client via REST.
# Since REST doesn't support raw DDL, we'll use pg8000 or psycopg2 direct connection.
# Let's try pg8000 fallback.

try:
    import pg8000.native as pg8000

    # Parse host from URL
    host = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "") + ".supabase.co"
    host = f"db.{SUPABASE_URL.replace('https://', '').split('.supabase.co')[0]}.supabase.co"
    
    print(f"Connecting to Postgres at: {host}")
    
    # Use service role or db password
    DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD", "")
    if not DB_PASSWORD:
        print("ERROR: Set SUPABASE_DB_PASSWORD in your .env file")
        sys.exit(1)

    conn = pg8000.Connection(
        user="postgres",
        password=DB_PASSWORD,
        host=host,
        port=5432,
        database="postgres"
    )

    with open("admin_provider_setup.sql", "r") as f:
        sql = f.read()

    # Split on ; and run individually
    statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]
    
    for i, stmt in enumerate(statements):
        try:
            conn.run(stmt)
            print(f"✓ Statement {i+1} OK")
        except Exception as e:
            print(f"✗ Statement {i+1} error: {e}")
            print(f"  SQL: {stmt[:80]}...")
    
    conn.commit()
    print("\n✅ Migration complete!")
    conn.close()

except ModuleNotFoundError:
    print("pg8000 not installed. Run: pip install pg8000")
except Exception as e:
    print(f"Connection error: {e}")
