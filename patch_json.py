import json
import os

filepath = "/Users/trungngo/.gemini/antigravity-ide/scratch/dttm-hue-clone/backend/data/tin-tuc-da-phuong-tien.json"
with open(filepath, 'r') as f:
    data = json.load(f)

for post in data['posts']:
    if post['id'] == "1784607472032":
        post['multimediaType'] = "image"
    elif post['id'] == "1784607501460":
        post['multimediaType'] = "infographic"
    elif post['id'] == "1784605243989" or post['id'] == "1784603001429":
        post['multimediaType'] = "video"
    elif 'multimediaType' not in post:
        post['multimediaType'] = "video"

with open(filepath, 'w') as f:
    json.dump(data, f, indent=2)

print("Patched successfully")
