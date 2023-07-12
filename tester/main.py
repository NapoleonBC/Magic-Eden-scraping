import requests
import time
import json

url = "https://api-mainnet.magiceden.io/v2/ord/btc/collections/bitmap"

headers = {"accept": "application/json"}

cnt = 0
flag = 200
while (True):
    response = requests.get(url, headers=headers)
    try:
        res = json.loads(response.text)
        status_code = res.get('statusCode', 200)
        if flag == status_code:
            cnt += 1
        else:
            cnt = 0
            flag = status_code
        print (f"~~~~~~~~~~~~~~~~~~~~~~~~~~ {cnt}s ~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print (res)
    except Exception as e:
        print (e.args[0])
        print (response.text)
    time.sleep(1)

print(response.text)