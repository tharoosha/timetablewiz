from pymongo import MongoClient
from datetime import datetime
from utils.database import client, db


collection = db["Spaces"]

def generate_spaces():
    spaces = []

    for i in range(1, 21):
        space = {
            "name": f"LH {i:02d}",
            "long_name": f"Lecture Hall {i:02d}",
            "code": f"LH{i:03d}",
            "capacity": 400,
            "attributes": {}
        }
        spaces.append(space)

    for i in range(1, 11):
        space = {
            "name": f"Lab {i:02d}",
            "long_name": f"Laboratory {i:02d}",
            "code": f"LAB{i:03d}",
            "capacity": 100,
            "attributes": {}
        }
        spaces.append(space)

    return spaces

def insert_spaces(spaces):
    try:
        result = collection.insert_many(spaces)
        print(f"Inserted {len(result.inserted_ids)} spaces successfully.")
    except Exception as e:
        print(f"Error inserting spaces: {e}")

spaces = generate_spaces()
insert_spaces(spaces)
