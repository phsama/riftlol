import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute("DELETE FROM alembic_version")
cur.execute("INSERT INTO alembic_version (version_num) VALUES ('ab1df731b28a')")
conn.commit()
print("Fixed!")
