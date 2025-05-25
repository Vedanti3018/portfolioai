import os
import requests

# Create images directory if it doesn't exist
os.makedirs('public/images', exist_ok=True)

# Image URLs (using placeholder images)
images = {
    'portfolio-builder.png': 'https://picsum.photos/800/600',
    'resume-generator.png': 'https://picsum.photos/800/600',
    'job-alerts.png': 'https://picsum.photos/800/600',
    'interview-coach.png': 'https://picsum.photos/800/600',
    'process-demo.png': 'https://picsum.photos/1200/800',
    'logo.svg': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNGRkZGRkYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwMDAwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5PPC90ZXh0Pjwvc3ZnPg=='
}

def download_and_save_image(url, filename):
    try:
        if filename.endswith('.svg'):
            # For SVG, write the base64 data directly
            svg_data = url.split(',')[1]
            with open(f'public/images/{filename}', 'wb') as f:
                f.write(svg_data.encode())
        else:
            # For other images, download and save
            response = requests.get(url)
            response.raise_for_status()
            with open(f'public/images/{filename}', 'wb') as f:
                f.write(response.content)
        print(f'Successfully downloaded {filename}')
    except Exception as e:
        print(f'Error downloading {filename}: {str(e)}')

# Download all images
for filename, url in images.items():
    download_and_save_image(url, filename)

print('All images downloaded successfully!') 