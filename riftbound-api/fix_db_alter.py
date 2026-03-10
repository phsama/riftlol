import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute("ALTER TABLE collections ADD COLUMN IF NOT EXISTS alt_art_foil_qty INTEGER NOT NULL DEFAULT 0;")
cur.execute("ALTER TABLE collections ADD COLUMN IF NOT EXISTS overnumbered_foil_qty INTEGER NOT NULL DEFAULT 0;")
conn.commit()
print("Columns added!")
