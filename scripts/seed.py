import asyncio
import os
import sys

# Ensure apps/api is on the python path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(os.path.dirname(current_dir), "apps", "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from app.core.seed import seed_database

if __name__ == "__main__":
    print("[JobPilot] Initializing standalone SQLite database and seeding demo data...")
    asyncio.run(seed_database())
    print("[JobPilot] Database seeding complete! JobPilot is ready to run with zero Docker requirements.")
