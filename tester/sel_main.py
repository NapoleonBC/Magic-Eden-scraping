from selenium import webdriver
import time

url = "https://api-mainnet.magiceden.io/v2/ord/btc/carousels/latest-sales"

# Configure the webdriver to use a browser
driver = webdriver.Chrome()

# Open the URL in the browser
while True:
    driver.get(url)

    # Get the page source (response text)
    response_text = driver.page_source

    # Print the response text
    print(response_text)

    time.sleep(0.1)

# Close the browser
driver.quit()