import fastf1 as f1

session = f1.get_session(2021, "Saudi Arabia", "R")
session.load()

result = session.results

print(result.head())
