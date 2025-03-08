import json

from numpy import iterable

def generate_activity_code(index):
    return f"AC-{index:03d}"

def find_teacher_for_subject(subject_code, teachers):
    for teacher in teachers:
        if subject_code in teacher["subjects"]:
            return teacher["id"]
    return None

def generate_activities(modules_file, teachers_file, output_file):
    with open(modules_file, 'r') as mf:
        modules = json.load(mf)

    with open(teachers_file, 'r') as tf:
        teachers = json.load(tf)

    activities = []
    subgroups = [
        "SEM101", "SEM102", "SEM201", "SEM202",
        "SEM301", "SEM302", "SEM401", "SEM402"
    ]

    activity_index = 1

    modules_requiring_labs_tutorials = [
        "CS103", "CS105", "CS202", "CS203", "CS204", 
        "CS301", "CS302", "CS303", "CS304", "CS305", 
        "CS311", "CS312", "CS313", "CS314", "CS412", "CS415"
    ]

    first_year_semesters = [
        ["CS101", "CS103", "CS111", "CS112", "CS113"],  
        ["CS102", "CS104", "CS105", "CS115", "CS114"],  
    ]

    second_year_semesters = [
        ["CS201", "CS202", "CS203", "CS211", "CS112"],  
        ["CS204", "CS205", "CS212", "CS213", "CS214"],  
    ]

    third_year_semesters = [
        ["CS301", "CS302", "CS303", "CS311", "CS312"],  
        ["CS304", "CS305", "CS313", "CS314", "CS315"],  
    ]

    fourth_year_semesters = [
        ["CS401", "CS402", "CS403", "CS411", "CS413"],  
        ["CS404", "CS405", "CS412", "CS414", "CS415"],  
    ]

    all_semesters = (
        first_year_semesters + 
        second_year_semesters + 
        third_year_semesters + 
        fourth_year_semesters
    )

    for i,sem in enumerate(all_semesters):
        for subject in sem:
            
            print (f"Generating activities for {subgroups[i]} of {subject}.")
            module = next((m for m in modules if m["code"] == subject), None)
            teacher_id = find_teacher_for_subject(subject, teachers)

            if not teacher_id:
                print(f"No teacher found for subject {subject}, skipping.")
                continue

            activity = {
                "code": generate_activity_code(activity_index),
                "name": f"{module['long_name']} Lecture",
                "subject": subject,
                "teacher_ids": [teacher_id],
                "subgroup_ids": [subgroups[i]],
                "duration": 2
            }
            activities.append(activity)
            activity_index += 1

            if subject in modules_requiring_labs_tutorials:
                activity = {
                    "code": generate_activity_code(activity_index),
                    "name": f"{module['long_name']} Tutorial",
                    "subject": subject,
                    "teacher_ids": [teacher_id],
                    "subgroup_ids": [subgroups[i]],
                    "duration": 2
                }
                activities.append(activity)
                activity_index += 1

                activity = {
                    "code": generate_activity_code(activity_index),
                    "name": f"{module['long_name']} Lab",
                    "subject": subject,
                    "teacher_ids": [teacher_id],
                    "subgroup_ids": [subgroups[i]],
                    "duration": 1
                }
                activities.append(activity)
                activity_index += 1
            

    # for module in modules:
    #     subject_code = module["code"]
    #     teacher_id = find_teacher_for_subject(subject_code, teachers)

    #     if not teacher_id:
    #         print(f"No teacher found for subject {subject_code}, skipping.")
    #         continue

    #     for subgroup in subgroups:
    #         print(f"Generating activities for {module['code']} {subgroup[3]}.")
    #         year = int(subgroup[3])
    #         sem = int(subgroup[5])
    #         if subject_code in all_semesters[year - 1][sem - 1]:
    #             activity = {
    #                 "code": generate_activity_code(activity_index),
    #                 "name": f"{module['long_name']} Lecture",
    #                 "subject": subject_code,
    #                 "teacher_ids": [teacher_id],
    #                 "subgroup_ids": [subgroup],
    #                 "duration": 2
    #             }
    #             activities.append(activity)
    #             activity_index += 1

    #     if subject_code in modules_requiring_labs_tutorials:
            
    #         for subgroup in subgroups:
    #             year = int(subgroup[3])
    #             sem = int(subgroup[5])
    #             if subject_code in all_semesters[year - 1][sem - 1]:
    #                 activity = {
    #                     "code": generate_activity_code(activity_index),
    #                     "name": f"{module['long_name']} Tutorial",
    #                     "subject": subject_code,
    #                     "teacher_ids": [teacher_id],
    #                     "subgroup_ids": [subgroup],
    #                     "duration": 2
    #                 }
    #                 activities.append(activity)
    #                 activity_index += 1

    #         for subgroup in subgroups:
    #             year = int(subgroup[3])
    #             sem = int(subgroup[5])
    #             if subject_code in all_semesters[year - 1][sem - 1]:
    #                 activity = {
    #                     "code": generate_activity_code(activity_index),
    #                     "name": f"{module['long_name']} Lab",
    #                     "subject": subject_code,
    #                     "teacher_ids": [teacher_id],
    #                     "subgroup_ids": [subgroup],
    #                     "duration": 1
    #                 }
    #                 activities.append(activity)
    #                 activity_index += 1

    with open(output_file, 'w') as of:
        json.dump(activities, of, indent=4)

modules_file = "data_insertion/modules.json"
teachers_file = "data_insertion/teachers.json"
output_file = "data_insertion/activities.json"

generate_activities(modules_file, teachers_file, output_file)
