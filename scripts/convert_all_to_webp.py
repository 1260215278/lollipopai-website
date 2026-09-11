from PIL import Image
import os

img_dir = r"c:\Users\Administrator\Documents\lollipop\public\blog-images"

# Convert all newly generated JPGs to WebP
jpg_files = [f for f in os.listdir(img_dir) if f.endswith('.jpg')]
print(f"Found {len(jpg_files)} JPG files")

total_before = 0
total_after = 0

for jpg in jpg_files:
    jpg_path = os.path.join(img_dir, jpg)
    webp_name = jpg.replace('.jpg', '.webp')
    webp_path = os.path.join(img_dir, webp_name)
    
    # Skip if webp already exists
    if os.path.exists(webp_path):
        print(f"  SKIP (exists): {webp_name}")
        continue
    
    try:
        img = Image.open(jpg_path)
        img.save(webp_path, 'WEBP', quality=80, method=6)
        jpg_size = os.path.getsize(jpg_path)
        webp_size = os.path.getsize(webp_path)
        savings = (1 - webp_size/jpg_size) * 100
        total_before += jpg_size
        total_after += webp_size
        print(f"  {jpg}: {jpg_size//1024}KB -> {webp_size//1024}KB ({savings:.0f}% saved)")
    except Exception as e:
        print(f"  ERROR converting {jpg}: {e}")

print(f"\nTotal: {total_before//1024}KB -> {total_after//1024}KB ({(1-total_after/total_before)*100:.0f}% saved)")

# Count all webp files
webp_files = [f for f in os.listdir(img_dir) if f.endswith('.webp')]
print(f"\nTotal WebP files in blog-images: {len(webp_files)}")
