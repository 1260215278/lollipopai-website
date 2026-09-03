"""
Convert all JPG/JPEG images in public/ to WebP format.
Quality: 80 (good balance of quality and size)
Skips: favicon PNGs, og-image.png (special format requirements)
"""
import os
from PIL import Image

BASE_DIR = r"c:\Users\Administrator\Documents\lollipop\public"

SKIP_DIRS = []  # no dirs to skip, but we skip specific files

def convert_to_webp(src_path, quality=80):
    """Convert an image to webp and return the new path."""
    base, ext = os.path.splitext(src_path)
    dst_path = base + ".webp"
    
    # Skip if webp already exists
    if os.path.exists(dst_path):
        return None, 0
    
    try:
        img = Image.open(src_path)
        original_size = os.path.getsize(src_path)
        
        # Handle RGBA for PNGs
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        img.save(dst_path, 'WEBP', quality=quality, method=6)
        new_size = os.path.getsize(dst_path)
        savings = original_size - new_size
        return dst_path, savings
    except Exception as e:
        print(f"  ERROR converting {src_path}: {e}")
        return None, 0

def main():
    total_savings = 0
    converted = 0
    skipped = 0
    
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg')):
                src = os.path.join(root, f)
                result, savings = convert_to_webp(src)
                if result:
                    rel = os.path.relpath(result, BASE_DIR)
                    orig_kb = os.path.getsize(src) / 1024
                    new_kb = os.path.getsize(result) / 1024
                    print(f"  {rel}: {orig_kb:.0f}KB -> {new_kb:.0f}KB ({(savings/1024):.0f}KB saved, {savings*100//os.path.getsize(src)}%)")
                    total_savings += savings
                    converted += 1
                else:
                    skipped += 1
    
    print(f"\nTotal: {converted} files converted, {skipped} skipped")
    print(f"Total savings: {total_savings / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
