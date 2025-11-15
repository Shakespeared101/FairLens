#!/usr/bin/env python3
"""
Simple script to create placeholder icons for WatchDogs extension.
Creates basic colored circles as icons if PIL is available.
"""

try:
    from PIL import Image, ImageDraw

    def create_icon(size, filename):
        """Create a simple icon with a circle and shield-like shape."""
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Main circle (background)
        padding = max(2, size // 16)
        draw.ellipse([padding, padding, size-padding, size-padding],
                     fill=(99, 102, 241, 255))  # Primary color

        # Inner circle
        inner_padding = max(4, size // 8)
        draw.ellipse([inner_padding, inner_padding, size-inner_padding, size-inner_padding],
                     fill=(15, 23, 42, 255))  # Dark background

        # Shield shape (simplified)
        center = size // 2
        shield_top = size // 4
        shield_width = size // 3

        # Simple shield representation
        shield_points = [
            (center, shield_top),
            (center + shield_width//2, shield_top + shield_width//4),
            (center + shield_width//2, shield_top + shield_width),
            (center, shield_top + shield_width + shield_width//4),
            (center - shield_width//2, shield_top + shield_width),
            (center - shield_width//2, shield_top + shield_width//4),
        ]

        draw.polygon(shield_points, fill=(99, 102, 241, 255))

        # Eyes (only for larger icons)
        if size >= 48:
            eye_y = shield_top + shield_width//2
            eye_size = max(2, size // 32)
            # Left eye
            draw.ellipse([center - shield_width//4 - eye_size, eye_y - eye_size,
                         center - shield_width//4 + eye_size, eye_y + eye_size],
                        fill=(255, 255, 255, 255))
            # Right eye
            draw.ellipse([center + shield_width//4 - eye_size, eye_y - eye_size,
                         center + shield_width//4 + eye_size, eye_y + eye_size],
                        fill=(255, 255, 255, 255))

        # Save
        img.save(filename, 'PNG')
        print(f"Created {filename}")

    # Create all required sizes
    create_icon(16, 'icon16.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')

    print("\nAll icons created successfully!")
    print("Icons are ready to use in your extension.")

except ImportError:
    print("PIL/Pillow not found.")
    print("Please install it with: pip install Pillow")
    print("Or use the generate-icons.html file in a browser to create icons.")
