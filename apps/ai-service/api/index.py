import os
import sys
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from app.main import app
except Exception:
    from fastapi import FastAPI

    app = FastAPI()

    @app.api_route(
        "/{path:path}",
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    )
    def debug_error(path: str):
        return {"debug": True, "path": path, "error": traceback.format_exc()}

# Vercel zero-config entry: exposes the FastAPI app as a serverless function.
