import os
from PIL import Image, ImageDraw

def create_slide_backgrounds():
    width = 3840
    height = 2160
    output_dir = r"C:\Users\Asus\Desktop\JSL"
    
    # -------------------------------------------------------------------------
    # Template 1: Premium Framed Master (Cleanest & Most Versatile)
    # Full crisp 4-sided corporate frame, subtle engineering grid, 100% open canvas
    # -------------------------------------------------------------------------
    img1 = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw1 = ImageDraw.Draw(img1)
    
    # Subtle engineering micro-grid
    for x in range(30, width - 30, 60):
        draw1.line([(x, 30), (x, height - 30)], fill=(244, 247, 250, 255), width=2)
    for y in range(30, height - 30, 60):
        draw1.line([(30, y), (width - 30, y)], fill=(244, 247, 250, 255), width=2)
        
    # Solid clean 4-side perimeter border (Dark Navy + Orange Hairline)
    # Outer dark navy border
    draw1.rectangle([28, 28, width - 28, height - 28], outline=(15, 34, 64, 255), width=16)
    # Inner subtle copper-orange hairline (2px) with slight inset
    draw1.rectangle([48, 48, width - 48, height - 48], outline=(234, 88, 12, 160), width=3)
    
    out1 = img1.convert("RGB")
    out1_path_jpg = os.path.join(output_dir, "slide_master_bg.jpg")
    out1_path_png = os.path.join(output_dir, "slide_master_bg.png")
    out1.save(out1_path_jpg, quality=98)
    out1.save(out1_path_png, quality=98)
    print("Generated slide_master_bg.jpg")

    # -------------------------------------------------------------------------
    # Template 2: Framed with Header Separator (For standard title-slide layout)
    # -------------------------------------------------------------------------
    img2 = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw2 = ImageDraw.Draw(img2)
    
    for x in range(30, width - 30, 60):
        draw2.line([(x, 30), (x, height - 30)], fill=(244, 247, 250, 255), width=2)
    for y in range(30, height - 30, 60):
        draw2.line([(30, y), (width - 30, y)], fill=(244, 247, 250, 255), width=2)
        
    # Outer frame
    draw2.rectangle([28, 28, width - 28, height - 28], outline=(15, 34, 64, 255), width=16)
    draw2.rectangle([48, 48, width - 48, height - 48], outline=(234, 88, 12, 160), width=3)
    
    # Header underline for title
    header_y = 220
    draw2.line([(60, header_y), (width - 60, header_y)], fill=(225, 232, 240, 255), width=3)
    draw2.line([(60, header_y), (540, header_y)], fill=(234, 88, 12, 255), width=5)
    
    out2 = img2.convert("RGB")
    out2_path = os.path.join(output_dir, "slide_master_bg_with_header_line.jpg")
    out2.save(out2_path, quality=98)
    print("Generated slide_master_bg_with_header_line.jpg")

if __name__ == "__main__":
    create_slide_backgrounds()
