from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Wait for dev server to be ready
    max_retries = 30
    for i in range(max_retries):
        try:
            page.goto('http://localhost:3000', timeout=2000)
            break
        except Exception:
            if i == max_retries - 1:
                print("Failed to connect to dev server")
                exit(1)
            time.sleep(1)

    time.sleep(3) # Wait for hydration and rendering
    page.screenshot(path="screenshot.png")
    browser.close()
