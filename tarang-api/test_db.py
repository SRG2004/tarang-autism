"""
Database Connection Test Script
Tests connection to Neon PostgreSQL database
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    print("=" * 60)
    print("TARANG Database Connection Test")
    print("=" * 60)
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not set in environment")
        print("   Please create .env file with DATABASE_URL=postgresql://...")
        return False
    
    # Mask password for display
    masked_url = database_url
    if "@" in database_url:
        parts = database_url.split("@")
        user_pass = parts[0].split("://")[1]
        if ":" in user_pass:
            user = user_pass.split(":")[0]
            masked_url = database_url.replace(user_pass, f"{user}:****")
    
    print(f"📡 Database URL: {masked_url}")
    
    try:
        from sqlalchemy import create_engine, text
        
        print("\n🔄 Connecting to database...")
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Test basic query
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected successfully!")
            print(f"📦 PostgreSQL version: {version[:50]}...")
            
            # Check if tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result.fetchall()]
            
            print(f"\n📋 Tables found: {len(tables)}")
            for table in tables:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"   • {table}: {count} rows")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check DATABASE_URL in .env file")
        print("   2. Ensure Neon database is active")
        print("   3. Verify SSL mode is set correctly")
        return False

if __name__ == "__main__":
    success = test_connection()
    print("\n" + "=" * 60)
    print("Result:", "✅ SUCCESS" if success else "❌ FAILED")
    print("=" * 60)
