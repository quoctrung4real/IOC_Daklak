import json
import os
import datetime

DATA_FILE = 'backend/data/thong-bao.json'

def seed_thong_bao():
    if not os.path.exists(DATA_FILE):
        print(f"{DATA_FILE} not found. Ensure backend is initialized.")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Thêm 5 tin thông báo có file đính kèm
    posts = data.get('Posts', [])
    
    for i in range(1, 6):
        now = datetime.datetime.now()
        dt_str = now.strftime('%Y-%m-%d %H:%M:%S')
        new_post = {
            "Id": f"thong_bao_test_{i}",
            "Title": f"Thông báo về việc triển khai công tác tháng {now.month} (Test {i})",
            "ImageUrl": "",
            "Source": "UBND Tỉnh",
            "Author": "Quản trị viên",
            "Content": f"<p>Đây là nội dung chi tiết của thông báo số {i}. Vui lòng tải tệp đính kèm bên dưới để xem chi tiết.</p>",
            "LinkUrl": "",
            "LinkText": "",
            "VideoUrl": "",
            "MultimediaType": "",
            "AttachmentUrl": f"/uploads/test_document_{i}.pdf",
            "AttachmentName": f"Tai_lieu_huong_dan_0{i}.pdf",
            "IsFeatured": False,
            "CreatedAt": dt_str,
            "Views": i * 10
        }
        posts.insert(0, new_post)

    data['Posts'] = posts

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print("Seeded 5 new 'thong-bao' posts with attachments successfully.")

if __name__ == '__main__':
    seed_thong_bao()
