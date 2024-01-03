import requests

def geocode_address(address):
    url = "http://api.map.baidu.com/geocoding/v3/"
    params = {
        "address": address,
        "ak": "82jWT21BQ8POmBYiqEa8Kuh0h9etG0Qg",
        "output": "json"
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data["status"] == 0:
            location = data["result"]["location"]
            print(f"Latitude: {location['lat']}")
            print(f"Longitude: {location['lng']}")
        else:
            print("No results found")
    except requests.RequestException as e:
        print(f"Request failed: {e}")

# 调用地理编码函数，传入公司名称或地址
geocode_address("武汉")
