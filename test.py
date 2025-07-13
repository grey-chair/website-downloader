from playwright.sync_api import sync_playwright
import urllib.request, os
from urllib.parse import urljoin

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    print("Navigating to website...")
    page.goto("https://www.suzannecollinsbooks.com")
    print("Page loaded successfully!")
    
    os.makedirs("images", exist_ok=True)
    images = page.query_selector_all("img")
    print(f"Found {len(images)} images on the page")
    
    for i, img in enumerate(images):
        src = img.get_attribute("src")
        print(f"Image {i+1}: {src}")
        if src:
            full_url = urljoin("https://www.suzannecollinsbooks.com", src)
            try:
                filename = os.path.basename(src)
                filepath = os.path.join("images", filename)
                print(f"Downloading {full_url} to {filepath}")
                urllib.request.urlretrieve(full_url, filepath)
                print(f"Successfully downloaded: {filename}")
            except Exception as e:
                print(f"Failed to download {full_url}: {e}")
    
    browser.close()
    print("Script completed!")
