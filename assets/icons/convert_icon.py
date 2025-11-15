#!/usr/bin/env python3
"""
Convert icon.jpg to required PNG formats for browser extension.
Creates icon16.png, icon48.png, and icon128.png
"""

try:
    from PIL import Image
    import os

    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Open the JPG icon
    icon_path = os.path.join(script_dir, 'icon.jpg')

    if not os.path.exists(icon_path):
        print("❌ Error: icon.jpg not found in the icons directory")
        exit(1)

    print("📂 Loading icon.jpg...")
    img = Image.open(icon_path)

    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        print("🔄 Converting to RGBA format...")
        img = img.convert('RGBA')

    # Define the sizes we need
    sizes = [16, 48, 128]

    print("\n🎨 Creating PNG icons...")
    for size in sizes:
        # Resize with high-quality resampling
        resized = img.resize((size, size), Image.Resampling.LANCZOS)

        # Save as PNG
        output_path = os.path.join(script_dir, f'icon{size}.png')
        resized.save(output_path, 'PNG', optimize=True)

        print(f"  ✅ Created icon{size}.png ({size}x{size})")

    print("\n🎉 Success! All icons created successfully!")
    print("\n📋 Files created:")
    print("  • icon16.png  (for browser toolbar)")
    print("  • icon48.png  (for extension management)")
    print("  • icon128.png (for Chrome Web Store)")
    print("\n✨ Your extension is now ready to use!")

except ImportError:
    print("❌ PIL/Pillow not found.")
    print("\n📦 Please install it with:")
    print("   pip install Pillow")
    print("\nOr use one of the alternative methods:")
    print("  1. Online converter: https://convertio.co/jpg-png/")
    print("  2. Use ImageMagick (if installed)")
    print("  3. Use any image editor (Photoshop, GIMP, etc.)")
    exit(1)

except FileNotFoundError:
    print("❌ Error: icon.jpg not found")
    print("Please make sure icon.jpg is in the assets/icons/ folder")
    exit(1)

except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)
