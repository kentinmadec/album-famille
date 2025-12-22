import os
import json

# ======================
# CONFIGURATION
# ======================

LOCAL_PHOTOS_DIR = r"C:\Users\kenti\photos\album-famille\photos"
OUTPUT_JSON = "photo-data.json"
BASE_PATH_IN_BUCKET = "photos/album-famille/photos"

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

# ======================
# GÉNÉRATION
# ======================

data = {}

for year in sorted(os.listdir(LOCAL_PHOTOS_DIR), reverse=True):
    year_path = os.path.join(LOCAL_PHOTOS_DIR, year)

    if not os.path.isdir(year_path):
        continue
    if not year.isdigit():
        continue

    data[year] = {}

    for album in sorted(os.listdir(year_path)):
        album_path = os.path.join(year_path, album)

        if not os.path.isdir(album_path):
            continue

        photos = []

        for file in sorted(os.listdir(album_path)):
            if file.lower().endswith(VALID_EXTENSIONS):
                photo_path = f"{BASE_PATH_IN_BUCKET}/{year}/{album}/{file}"
                photos.append(photo_path)

        if photos:
            data[year][album] = photos

# ======================
# ÉCRITURE DU JSON
# ======================

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ photo-data.json généré avec succès")
