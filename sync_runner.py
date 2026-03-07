import httpx
import asyncio

async def run():
  async with httpx.AsyncClient(timeout=300.0) as client:
    res = await client.post('http://127.0.0.1:8000/api/cards/sync')
    print(res.status_code)
    print(res.text)

asyncio.run(run())