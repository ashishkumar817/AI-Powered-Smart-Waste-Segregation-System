import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "instance", "database.db")

def migrate():
    print(f"Migrating database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("Database not found! Exiting.")
        return
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(user)")
    columns = [info[1] for info in cursor.fetchall()]
    
    try:
        if 'phone_number' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN phone_number VARCHAR(20)")
            print("Added phone_number column")
            
        if 'created_at' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN created_at DATETIME")
            cursor.execute("UPDATE user SET created_at = datetime('now') WHERE created_at IS NULL")
            print("Added created_at column")
            
        if 'last_login' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN last_login DATETIME")
            print("Added last_login column")
            
        conn.commit()
        print("Migration complete!")
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
