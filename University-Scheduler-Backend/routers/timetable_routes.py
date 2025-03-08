from fastapi import APIRouter, HTTPException, Depends
from routers.user_router import get_current_user
from utils.database import db
from typing import List
from generator.algorithms.ga.ga import *
from generator.algorithms.co.co_v2 import *
# from generator.algorithms.rl.rl_train import *
from generator.algorithms.rl.rl import *
from generator.algorithms.eval.eval import *
from datetime import datetime

from models.timetable_model import Timetable


router = APIRouter()

@router.post("/generate")
async def generate_timetable(current_user: dict = Depends(get_current_user)):
    pop, log, hof, li = generate_ga()
    save_timetable(li, "GA", current_user)
    sol = generate_co()
    save_timetable(sol, "CO", current_user)
    gen = generate_rl()
    save_timetable(gen, "RL", current_user)
    eval = evaluate()
    store_latest_score(eval)
    for algorithm, scores in eval.items():
        average_score = sum(scores) / len(scores)
        eval[algorithm] = {
            "average_score": average_score,
        }

    db["notifications"].insert_one({"message": "Latest evaluation results available", "type": "success", "read": False, "recipient": current_user["id"]})
    return {"message": "Timetable generated", "eval": eval }

def save_timetable(li, algorithm, current_user):
    subgroups = [
        "SEM101", "SEM102", "SEM201", "SEM202",
        "SEM301", "SEM302", "SEM401", "SEM402"
    ]
    semester_timetables = {semester: [] for semester in subgroups}  

    for activity in li:
        subgroup_id = activity["subgroup"] 
        semester_timetables[subgroup_id].append(activity)
    index = 0
    for semester, activities in semester_timetables.items():
        db["Timetable"].replace_one(
            {
                "$and": [
                    {"semester": semester},
                    {"algorithm": algorithm}
                ]
            },
            {
            "code": generate_timetable_code(index, algorithm),
            "algorithm": algorithm,
             "semester": semester, 
             "timetable": activities},
            upsert=True
        )
        db["old_timetables"].insert_one({
            "code": generate_timetable_code(index, algorithm),
            "algorithm": algorithm,
            "semester": semester, 
            "timetable": activities,
            "date_created": datetime.now()
        })
        index +=1
    db["notifications"].insert_one({
        "message": f"New timetable generated using {algorithm== 'GA' and 'Genetic Algorithm' or algorithm == 'CO' and 'Colony Optimization' or 'Reinforcement Learning'}",
        "type": "success",
        "read": False,
        "recipient": current_user["id"]
    })
    

def generate_timetable_code(index, algorithm):
    return f"{algorithm}-TT000{index}"

@router.get("/timetables")
async def get_timetables():
    timetables = list(db["Timetable"].find())
    cleaned_timetables = clean_mongo_documents(timetables)
    eval =  db["settings"].find_one({"option": "latest_score"})
    eval = clean_mongo_documents(eval)
    print(eval)
    for algorithm, scores in eval["value"].items():
        average_score = sum(scores) / len(scores)
        eval[algorithm] = {
            "average_score": average_score,
        }
    
    out ={
        "timetables": cleaned_timetables,
        "eval": eval
    }
    
    return out

@router.post("/select")
async def select_algorithm(algo: dict, current_user: dict = Depends(get_current_user)):
    result = db["settings"].find_one({"option": "selected_algorithm"})
    if result:
        db["settings"].update_one(
            {"option": "selected_algorithm"},
            {"$set": {"value": algo["algorithm"]}}
        )
    else:
        db["settings"].insert_one({"option": "selected_algorithm", "value": algo})
    return {"message": "Algorithm selected", "selected_algorithm": algo}

@router.get("/selected")
async def get_selected_algorithm(current_user: dict = Depends(get_current_user)):
    result = db["settings"].find_one({"option": "selected_algorithm"})
    if result:
        return {"selected_algorithm": result["value"]}
    return {"selected_algorithm": None}

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = list(db["notifications"].find({
        "recipient": current_user["id"],
        "read": False
    }))
    notifications = clean_mongo_documents(notifications)
    return notifications

@router.put("/notifications/{notification_id}")
async def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = db["notifications"].update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

from bson import ObjectId

def clean_mongo_documents(doc):
    if isinstance(doc, list):
        return [clean_mongo_documents(item) for item in doc]
    if isinstance(doc, dict):
        return {key: clean_mongo_documents(value) for key, value in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc

def store_latest_score(score):
    db["settings"].update_one(
        {"option": "latest_score"},
        {"$set": {"value": score}},
        upsert=True
    )
    db["old_scores"].insert_one({"value": score})

    