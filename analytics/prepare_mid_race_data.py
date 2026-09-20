import requests
import pandas as pd
import numpy as np
import time
import os

def build_dataset(seasons=[2023, 2024], output_csv="analytics/driver_lap_clean.csv"):
    """
    Downloads lap data and session results from OpenF1 API for specified seasons,
    merges pre-race features from train.csv, performs mid-race feature engineering,
    and saves the cleaned dataset.
    """
    print(f"Starting mid-race dataset compilation for seasons {seasons}...")

    # Load train.csv for pre-race features
    train_path = "analytics/train.csv"
    if not os.path.exists(train_path):
        raise FileNotFoundError(f"Required train dataset '{train_path}' not found!")
        
    df_train = pd.read_csv(train_path)
    df_train["race_date_norm"] = pd.to_datetime(df_train["race_date"], utc=True).dt.normalize()

    print(f"Loaded train.csv with {len(df_train)} rows across seasons: {df_train['season'].unique()}")

    # Fetch race sessions from OpenF1
    all_sessions = []
    for year in seasons:
        try:
            url = f"https://api.openf1.org/v1/sessions?year={year}&session_name=Race"
            res = requests.get(url, timeout=10).json()
            if isinstance(res, list):
                all_sessions.extend(res)
        except Exception as e:
            print(f"Error fetching sessions for {year}: {e}")

    print(f"Found {len(all_sessions)} total race sessions in OpenF1.")

    laps_list = []
    results_list = []

    for idx, sess in enumerate(all_sessions):
        s_key = sess["session_key"]
        c_name = sess.get("circuit_short_name", sess.get("location", f"Session {s_key}"))
        s_date = sess.get("date_start")
        print(f"[{idx+1}/{len(all_sessions)}] Processing session {s_key} ({c_name}, {s_date[:10] if s_date else ''})...")
        
        # Fetch laps
        try:
            laps_res = requests.get(f"https://api.openf1.org/v1/laps?session_key={s_key}", timeout=15).json()
            if isinstance(laps_res, list) and len(laps_res) > 0:
                df_l = pd.DataFrame(laps_res)
                df_l["date_start_raw"] = s_date
                laps_list.append(df_l)
        except Exception as e:
            print(f"  Error laps for {s_key}: {e}")
            
        # Fetch session results
        try:
            res_data = requests.get(f"https://api.openf1.org/v1/session_result?session_key={s_key}", timeout=15).json()
            if isinstance(res_data, list) and len(res_data) > 0:
                df_r = pd.DataFrame(res_data)
                results_list.append(df_r)
        except Exception as e:
            print(f"  Error results for {s_key}: {e}")
            
        time.sleep(0.05)

    if not laps_list:
        raise RuntimeError("No lap data was downloaded!")

    df_all_laps = pd.concat(laps_list, ignore_index=True)
    df_all_results = pd.concat(results_list, ignore_index=True)

    print(f"\nRaw laps downloaded: {len(df_all_laps)}")
    print(f"Raw results downloaded: {len(df_all_results)}")

    # Calculate running position per lap safely with ISO8601 datetime parsing
    if "date_start" in df_all_laps.columns:
        df_all_laps["date_start_dt"] = pd.to_datetime(df_all_laps["date_start"], format="ISO8601", utc=True, errors="coerce")
        df_all_laps.sort_values(by=["session_key", "lap_number", "date_start_dt"], inplace=True)

    df_all_laps["position"] = df_all_laps.groupby(["session_key", "lap_number"]).cumcount() + 1
    df_all_laps["total_laps"] = df_all_laps.groupby("session_key")["lap_number"].transform("max")
    df_all_laps["lap_remaining"] = df_all_laps["total_laps"] - df_all_laps["lap_number"] + 1

    # Map final position
    if "driver_number" in df_all_results.columns and "position" in df_all_results.columns:
        res_map = df_all_results.set_index(["session_key", "driver_number"])["position"].to_dict()
        df_all_laps["final_position"] = df_all_laps.set_index(["session_key", "driver_number"]).index.map(res_map)

    df_all_laps["race_date_norm"] = pd.to_datetime(df_all_laps["date_start_raw"], utc=True).dt.normalize()

    # Merge pre-race features from train.csv
    train_subset = df_train[[
        "race_date_norm", "driver_number", "season", "round", "driver", "constructor",
        "grid", "avg_circuit_points", "constructor_pts_per_race", "dnf_last5"
    ]].drop_duplicates(subset=["race_date_norm", "driver_number"])

    df_merged = pd.merge(df_all_laps, train_subset, on=["race_date_norm", "driver_number"], how="left")

    # Feature Engineering
    df_merged["won"] = (df_merged["final_position"] == 1).astype(int)
    df_merged["positions_gained"] = df_merged["grid"] - df_merged["position"]
    df_merged["positions_to_gain"] = df_merged["position"] - 1
    df_merged["gain_per_lap"] = df_merged["positions_to_gain"] / df_merged["lap_remaining"].clip(lower=1)
    df_merged["pct_race_completed"] = df_merged["lap_number"] / df_merged["total_laps"].clip(lower=1)

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df_merged.to_csv(output_csv, index=False)

    print(f"\nSuccessfully built dataset! Saved to {output_csv}")
    print(f"Dataset shape: {df_merged.shape}")
    return df_merged

if __name__ == "__main__":
    build_dataset()
