# WatchDogs Extension Icons

## Creating Icons

You have three options to create the required icon files:

### Option 1: Use the HTML Generator (Recommended)
1. Open `generate-icons.html` in your web browser
2. Click "Generate Icons" button
3. Right-click each canvas and "Save Image As..."
4. Save as `icon16.png`, `icon48.png`, and `icon128.png` in this folder

### Option 2: Use Python Script
```bash
pip install Pillow
python3 create_icons.py
```

### Option 3: Use ImageMagick
```bash
./create-icons.sh
```

### Option 4: Use Your Own Icons
Simply replace the icon files with your own:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Design Guidelines

The WatchDogs icon features:
- Shield shape representing protection
- Dog/watchdog motif
- Primary color: #6366f1 (Indigo)
- Dark background: #0f172a
- Alert indicator in red: #ef4444

## Temporary Workaround

If you want to test the extension without creating icons, you can:
1. Create any simple PNG files with the required names
2. Or use the SVG file as a reference to create your own
