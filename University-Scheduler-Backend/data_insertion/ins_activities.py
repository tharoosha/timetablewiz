from pymongo import MongoClient
from datetime import datetime
from database import client, db
import json

collection = db["Activities"]




def load_activities_from_json(json_file):
    with open(json_file, 'r') as file:
        activities = json.load(file)
    return activities

def insert_activities_into_mongo(activities):
    try:
        result = collection.insert_many(activities)
        print(f"Inserted {len(result.inserted_ids)} activities successfully.")
    except Exception as e:
        print(f"Error inserting activities: {e}")

activities_file = "data_insertion/activities.json"  

activities = load_activities_from_json(activities_file)

insert_activities_into_mongo(activities)
