import asyncio
import asyncpg
import os
from dotenv import load_dotenv
load_dotenv('riftbound-api/.env')
async def test():
    url = os.getenv('DATABASE_URL').replace('postgresql://', 'postgresql://')
    conn = await asyncpg.connect(url)
    val = await conn.fetchval('SELECT COUNT(*) FROM cards')
    print('TOTAL:', val)
    await conn.close()
asyncio.run(test())