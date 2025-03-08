from pymongo import MongoClient

MONGODB_URI: str = "mongodb+srv://tharooshavihidun:f6BBU0QNSeNp1G4U@cluster0.fndwc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


client = MongoClient(MONGODB_URI)
db = client["time_table_whiz"]

