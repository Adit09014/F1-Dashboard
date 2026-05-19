import fastf1
import pandas as pd

session = fastf1.get_session(2026, "Miami", "R")
session.load()

laps = session.laps

pit_data = []

for _, lap in laps.iterrows():
    if pd.notna(lap["PitInTime"]) and pd.notna(lap["PitOutTime"]):
        duration = (lap["PitOutTime"] - lap["PitInTime"]).total_seconds()

        pit_data.append(
            {
                "Driver": lap["Driver"],
                "Lap": lap["LapNumber"],
                "Pit Duration": round(duration, 3),
            }
        )

pit_df = pd.DataFrame(pit_data)

if pit_df.empty:
    print("No pit stop data found")

else:
    fastest_pit = pit_df.sort_values(by="Pit Duration").iloc[0]

    print("\nFastest Pit Stop\n")
    print(fastest_pit)
