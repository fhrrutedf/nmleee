import psycopg2
import os
import json

def get_recent_course():
    # Attempt to find the database URL from .env
    db_url = ""
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    db_url = line.split('=')[1].strip().strip('"')
    except:
        pass
    
    if not db_url:
        print("DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Get the most recent course
        cur.execute('SELECT id, title, price FROM "Course" ORDER BY "createdAt" DESC LIMIT 1;')
        course = cur.fetchone()
        
        if course:
            print(f"RECENT_COURSE_ID: {course[0]}")
            print(f"TITLE: {course[1]}")
            print(f"PRICE: {course[2]}")
            
            # Update price to 0
            cur.execute('UPDATE "Course" SET price = 0 WHERE id = %s;', (course[0],))
            conn.commit()
            print("Successfully set price to 0 for test.")
        else:
            print("No courses found in database.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    get_recent_course()
