from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import traceback
from app.api.endpoints import decks
from app.api.endpoints import collection
from app.api.endpoints import cards

app = FastAPI(title="Riftbound API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb_str = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    return PlainTextResponse(f"FASTAPI 500 ERROR:\n{tb_str}", status_code=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decks.router, prefix="/api")
app.include_router(collection.router, prefix="/api")
app.include_router(cards.router, prefix="/api/cards")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/test")
def test_endpoint():
    return {"status": "python is alive!"}
