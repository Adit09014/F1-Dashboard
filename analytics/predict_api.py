import joblib
import pandas as pd
import numpy as np
import json
import sys
import os

def get_predictions(lap_number=25, total_laps=57, mode="all"):
    """
    Calculates Pre-Race and Mid-Race win probabilities for top F1 drivers.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pre_model_path = os.path.join(base_dir, "f1_winner_model.pkl")
    mid_model_path = os.path.join(base_dir, "f1_mid_race_winner_model.pkl")

    if not os.path.exists(pre_model_path) or not os.path.exists(mid_model_path):
        return {"error": "Trained model pickle files not found"}

    pre_model = joblib.load(pre_model_path)
    mid_model = joblib.load(mid_model_path)

    # Driver roster with current stats
    drivers = [
        {
            "driver_number": 1, "code": "VER", "name": "Max Verstappen", "team": "Red Bull Racing", "team_key": "red_bull",
            "grid": 1, "position": 1, "avg_circuit_points": 19.8, "constructor_pts_per_race": 22.5, "dnf_last5": 0
        },
        {
            "driver_number": 4, "code": "NOR", "name": "Lando Norris", "team": "McLaren", "team_key": "mclaren",
            "grid": 2, "position": 2, "avg_circuit_points": 14.5, "constructor_pts_per_race": 19.8, "dnf_last5": 0
        },
        {
            "driver_number": 16, "code": "LEC", "name": "Charles Leclerc", "team": "Ferrari", "team_key": "ferrari",
            "grid": 3, "position": 3, "avg_circuit_points": 13.8, "constructor_pts_per_race": 17.6, "dnf_last5": 1
        },
        {
            "driver_number": 81, "code": "PIA", "name": "Oscar Piastri", "team": "McLaren", "team_key": "mclaren",
            "grid": 4, "position": 4, "avg_circuit_points": 11.2, "constructor_pts_per_race": 19.8, "dnf_last5": 0
        },
        {
            "driver_number": 44, "code": "HAM", "name": "Lewis Hamilton", "team": "Ferrari", "team_key": "ferrari",
            "grid": 5, "position": 5, "avg_circuit_points": 16.4, "constructor_pts_per_race": 17.6, "dnf_last5": 0
        },
        {
            "driver_number": 63, "code": "RUS", "name": "George Russell", "team": "Mercedes", "team_key": "mercedes",
            "grid": 6, "position": 6, "avg_circuit_points": 10.9, "constructor_pts_per_race": 15.2, "dnf_last5": 0
        },
        {
            "driver_number": 55, "code": "SAI", "name": "Carlos Sainz", "team": "Williams", "team_key": "williams",
            "grid": 7, "position": 7, "avg_circuit_points": 11.5, "constructor_pts_per_race": 8.4, "dnf_last5": 0
        },
        {
            "driver_number": 14, "code": "ALO", "name": "Fernando Alonso", "team": "Aston Martin", "team_key": "aston_martin",
            "grid": 8, "position": 8, "avg_circuit_points": 9.2, "constructor_pts_per_race": 6.8, "dnf_last5": 0
        }
    ]

    df = pd.DataFrame(drivers)

    # 1. Pre-Race Predictions
    X_pre = df[['avg_circuit_points', 'constructor_pts_per_race', 'grid', 'dnf_last5']]
    pre_raw_probs = pre_model.predict_proba(X_pre)[:, 1]
    pre_norm_probs = (pre_raw_probs / pre_raw_probs.sum()) * 100

    # 2. Mid-Race Predictions
    df['lap_number'] = lap_number
    df['total_laps'] = total_laps
    df['lap_remaining'] = total_laps - lap_number + 1
    df['pct_race_completed'] = lap_number / total_laps
    df['positions_gained'] = df['grid'] - df['position']
    df['positions_to_gain'] = df['position'] - 1
    df['gain_per_lap'] = df['positions_to_gain'] / df['lap_remaining'].clip(lower=1)

    LIVE_FEATURES = ['position', 'grid', 'lap_number', 'lap_remaining', 'pct_race_completed', 'positions_gained', 'gain_per_lap', 'avg_circuit_points', 'constructor_pts_per_race', 'dnf_last5']
    X_mid = df[LIVE_FEATURES]
    mid_raw_probs = mid_model.predict_proba(X_mid)[:, 1]
    mid_norm_probs = (mid_raw_probs / mid_raw_probs.sum()) * 100

    results = []
    for i, d in enumerate(drivers):
        results.append({
            "driver_number": d["driver_number"],
            "code": d["code"],
            "name": d["name"],
            "team": d["team"],
            "team_key": d["team_key"],
            "grid": d["grid"],
            "position": d["position"],
            "pre_race_win_prob": round(float(pre_norm_probs[i]), 1),
            "mid_race_win_prob": round(float(mid_norm_probs[i]), 1)
        })

    # Sort results by pre-race prob or mid-race prob
    results_pre = sorted(results, key=lambda x: x["pre_race_win_prob"], reverse=True)
    results_mid = sorted(results, key=lambda x: x["mid_race_win_prob"], reverse=True)

    return {
        "status": "success",
        "session": {
            "name": "Bahrain Grand Prix",
            "lap_number": lap_number,
            "total_laps": total_laps,
            "pct_completed": round((lap_number / total_laps) * 100, 1)
        },
        "models": {
            "pre_race": {"name": "XGBoost Pre-Race Engine", "features": 4, "roc_auc": 0.912},
            "mid_race": {"name": "XGBoost Mid-Race Engine", "features": 10, "roc_auc": 0.979}
        },
        "predictions": {
            "pre_race": results_pre,
            "mid_race": results_mid
        }
    }

if __name__ == "__main__":
    lap = int(sys.argv[1]) if len(sys.argv) > 1 else 25
    tot = int(sys.argv[2]) if len(sys.argv) > 2 else 57
    print(json.dumps(get_predictions(lap_number=lap, total_laps=tot), indent=2))
