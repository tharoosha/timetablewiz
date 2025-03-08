from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

MONGODB_URI: str = f"mongodb+srv://tharooshavihidun:{DATABASE_PASSWORD}@cluster0.fndwc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGODB_URI)
db = client["time_table_whiz"]

