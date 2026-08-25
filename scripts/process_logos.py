import os
import shutil
from PIL import Image

def process_logos():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dark_src = os.path.join(root_dir, "JobPilot Dark.png")
    light_src = os.path.join(root_dir, "JobPilot Light.png")
    
    public_dir = os.path.join(root_dir, "apps", "web", "public")
    app_dir = os.path.join(root_dir, "apps", "web", "app")
    docs_dir = os.path.join(root_dir, "docs", "assets")
    
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(app_dir, exist_ok=True)
    os.makedirs(docs_dir, exist_ok=True)
    
    img_dark = Image.open(dark_src).convert("RGBA")
    img_light = Image.open(light_src).convert("RGBA")
    
    # 1. Save high-res optimized PNGs and WebPs to public
    img_dark.save(os.path.join(public_dir, "logo-dark.png"), format="PNG", optimize=True)
    img_light.save(os.path.join(public_dir, "logo-light.png"), format="PNG", optimize=True)
    img_dark.save(os.path.join(public_dir, "logo-dark.webp"), format="WEBP", quality=95, method=6)
    img_light.save(os.path.join(public_dir, "logo-light.webp"), format="WEBP", quality=95, method=6)
    
    # Also save to docs/assets for markdown documentation
    img_dark.save(os.path.join(docs_dir, "logo-dark.png"), format="PNG", optimize=True)
    img_light.save(os.path.join(docs_dir, "logo-light.png"), format="PNG", optimize=True)
    
    # Function to create square padded icon
    def make_square_icon(image: Image.Image, size: int, padding_ratio: float = 0.08) -> Image.Image:
        # Calculate aspect ratio
        w, h = image.size
        target_inner_w = int(size * (1 - 2 * padding_ratio))
        target_inner_h = int(size * (1 - 2 * padding_ratio))
        
        # Scale maintaining aspect ratio
        scale = min(target_inner_w / w, target_inner_h / h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        
        resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create transparent square canvas
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset_x = (size - new_w) // 2
        offset_y = (size - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y), resized)
        return canvas

    # 2. Generate multi-size square icons
    for size in [512, 192, 180, 64, 48, 32, 16]:
        icon_dark = make_square_icon(img_dark, size)
        icon_light = make_square_icon(img_light, size)
        
        icon_dark.save(os.path.join(public_dir, f"icon-dark-{size}.png"), format="PNG", optimize=True)
        icon_light.save(os.path.join(public_dir, f"icon-light-{size}.png"), format="PNG", optimize=True)
        
        if size == 512:
            icon_dark.save(os.path.join(public_dir, "icon-512x512.png"), format="PNG", optimize=True)
            icon_dark.save(os.path.join(public_dir, "icon.png"), format="PNG", optimize=True)
            icon_dark.save(os.path.join(app_dir, "icon.png"), format="PNG", optimize=True)
        elif size == 192:
            icon_dark.save(os.path.join(public_dir, "icon-192x192.png"), format="PNG", optimize=True)
        elif size == 180:
            icon_dark.save(os.path.join(public_dir, "apple-touch-icon.png"), format="PNG", optimize=True)
            icon_dark.save(os.path.join(app_dir, "apple-icon.png"), format="PNG", optimize=True)
        elif size == 32:
            icon_dark.save(os.path.join(public_dir, "favicon-32x32.png"), format="PNG", optimize=True)
        elif size == 16:
            icon_dark.save(os.path.join(public_dir, "favicon-16x16.png"), format="PNG", optimize=True)

    # 3. Generate multi-resolution favicon.ico
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_images = [make_square_icon(img_dark, s[0]) for s in ico_sizes]
    
    ico_path_public = os.path.join(public_dir, "favicon.ico")
    ico_path_app = os.path.join(app_dir, "favicon.ico")
    
    ico_images[0].save(
        ico_path_public,
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:],
    )
    
    ico_images[0].save(
        ico_path_app,
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:],
    )
    
    print("[JobPilot] Generated all logo & favicon assets successfully.")
    
    # 4. Remove original loose files from root if present
    if os.path.exists(dark_src):
        os.remove(dark_src)
        print("[JobPilot] Moved 'JobPilot Dark.png' into apps/web/public/logo-dark.png")
    if os.path.exists(light_src):
        os.remove(light_src)
        print("[JobPilot] Moved 'JobPilot Light.png' into apps/web/public/logo-light.png")

if __name__ == "__main__":
    process_logos()
