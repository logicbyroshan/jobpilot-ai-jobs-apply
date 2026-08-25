import os
import sys
import socket
import uvicorn

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

if __name__ == "__main__":
    env_port = int(os.environ.get("PORT", "0"))
    if env_port > 0:
        port = env_port
    elif is_port_in_use(8000):
        # If 8000 is occupied by another app, gracefully use 8001
        port = 8001
    else:
        port = 8000

    print(f"Starting JobPilot API on http://127.0.0.1:{port}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False, log_level="info")
