from PIL import Image

def create_spritesheet():
    try:
        # Load original customer image
        original = Image.open("src/assets/sprites/customer.png")
        width, height = original.size
        
        # Create new image double the width for 2 frames
        spritesheet = Image.new("RGBA", (width * 2, height), (0, 0, 0, 0))
        
        # Frame 1: Original
        spritesheet.paste(original, (0, 0))
        
        # Frame 2: Bobbing down 1 pixel (Simple animation)
        # Create a copy and shift content down
        frame2 = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        # Crop the original slightly to shift it? Or just paste at offset?
        # Let's paste at (0, 1) and crop the bottom 1px if needed, but canvas is same size
        # Actually, just pasting at 0,1 is fine if we have space, but we might lose feet.
        # Let's squash it slightly? No, let's just shift Y+1.
        # If the image has empty space at bottom it's fine.
        spritesheet.paste(original, (width, 1)) 
        
        spritesheet.save("src/assets/sprites/customer_spritesheet.png", "PNG")
        print("Created src/assets/sprites/customer_spritesheet.png")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_spritesheet()
