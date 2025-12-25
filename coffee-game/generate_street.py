from PIL import Image, ImageDraw
import random

def create_street_tile():
    width = 64
    height = 32
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Asphalt color
    base_color = (80, 80, 80, 255) # Dark Grey
    noise_color = (100, 100, 100, 255) # Lighter Grey

    # Draw Diamond Shape
    for y in range(height):
        for x in range(width):
            if abs(x - 32)/32 + abs(y - 16)/16 <= 1:
                draw.point((x, y), fill=base_color)

    # Add noise for asphalt texture
    for _ in range(300):
        x = random.randint(0, width-1)
        y = random.randint(0, height-1)
        if abs(x - 32)/32 + abs(y - 16)/16 <= 0.95:
            draw.point((x, y), fill=noise_color)

    # Draw Sidewalk/Curb (Top edge)
    # A lighter strip at the "back" of the tile to act as a curb
    curb_color = (180, 180, 180, 255)
    for y in range(height):
        for x in range(width):
            # Top-left and Top-right edges
            # Top-left: y = -0.5x + 16
            # Top-right: y = 0.5x - 16
            # We want a strip near these edges
            
            # Check if it's near the top edges
            # (Simplification: just draw a line for now)
            pass

    image.save("src/assets/sprites/street_tile.png", "PNG")
    print("Created src/assets/sprites/street_tile.png")

if __name__ == "__main__":
    create_street_tile()
