# import requests

# customer_id = "fb9a600-2778-11f1-9cdc-43ca8f8cdcc9"
# API_BASE = "https://app.swatch360.seple.in/"
# # Get devices of customer
# url = (
#     f"{API_BASE}/api/customer/{customer_id}/devices"
#     f"?pageSize=100&page=0"
# )

# headers = {
#     "Authorization": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzb3ZhbnNlcGxlQGdtYWlsLmNvbSIsInVzZXJJZCI6ImRkYzhmNTQwLTY0YmMtMTFmMS04YzU1LTViYjgyODRjNmFlZiIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwic2Vzc2lvbklkIjoiZGU3NDQ0MjQtYTU3Yy00Njk5LThiYzctY2RkNDE1MGUwY2RlIiwiZXhwIjoxNzg5NDUzMjI1LCJpc3MiOiJzZXBsZW5vdmFlZGdlLmNvbSIsImlhdCI6MTc4OTQ0NDIyNSwiZmlyc3ROYW1lIjoiU292YW4iLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiMjRkNzRiYjAtMjA2MS0xMWVlLTg2ZDUtZjU4ZmIxODk2NTdiIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.0jo-JPh4SMtJq1ug5Zw7Qvq9vVDD9bp3zhwO7GFnhYD6gtTK_EWwNqtJYxBqsNJDepzsiA_zwgXEdN_gMdektw",
#     "Accept": "application/json"
# }

# response = requests.get(url, headers=headers)
# response.raise_for_status()

# devices = response.json()

# zo_names = []

# for device in devices.get("data", []):
#     device_id = device["id"]["id"]

#     attribute_url = (
#         f"{API_BASE}/plugins/telemetry/DEVICE/"
#         f"{device_id}/values/attributes/SERVER_SCOPE"
#     )

#     attr_response = requests.get(
#         attribute_url,
#         headers=headers
#     )

#     attr_response.raise_for_status()

#     attributes = attr_response.json()

#     for attr in attributes:
#         if attr["key"] == "zoName":
#             zo_names.append(attr["value"])
#             break

# print(zo_names)

token = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzb3ZhbnNlcGxlQGdtYWlsLmNvbSIsInVzZXJJZCI6ImRkYzhmNTQwLTY0YmMtMTFmMS04YzU1LTViYjgyODRjNmFlZiIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwic2Vzc2lvbklkIjoiZGU3NDQ0MjQtYTU3Yy00Njk5LThiYzctY2RkNDE1MGUwY2RlIiwiZXhwIjoxNzg5NDUzMjI1LCJpc3MiOiJzZXBsZW5vdmFlZGdlLmNvbSIsImlhdCI6MTc4OTQ0NDIyNSwiZmlyc3ROYW1lIjoiU292YW4iLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiMjRkNzRiYjAtMjA2MS0xMWVlLTg2ZDUtZjU4ZmIxODk2NTdiIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.0jo-JPh4SMtJq1ug5Zw7Qvq9vVDD9bp3zhwO7GFnhYD6gtTK_EWwNqtJYxBqsNJDepzsiA_zwgXEdN_gMdektw"

import requests

customer_id = "fb98a600-2778-11f1-9cdc-43ca8fc8dcc9"
API_BASE = "https://app.swatch360.seple.in"

url = (
    f"{API_BASE}/api/customer/{customer_id}/devices"
    f"?pageSize=100&page=0"
)

headers = {
    "Authorization": f"{token}",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)

print("Status:", response.status_code)
print(response.text)

response.raise_for_status()

result = response.json()

device_ids = [
    device["id"]["id"]
    for device in result.get("data", [])
]

print("\nDevice IDs:")
for device_id in device_ids:
    print(device_id)



print(",".join(
f'"{device["id"]["id"]}"'
for device in result.get("data", [])
))