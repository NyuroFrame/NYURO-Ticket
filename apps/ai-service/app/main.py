from fastapi import FastAPI
from app.routers import health

app = FastAPI(title="Nyuro AI Service", version="0.0.1")

app.include_router(health.router)
