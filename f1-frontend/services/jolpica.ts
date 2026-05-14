const BASE_URL = "https://api.jolpi.ca/ergast/f1";

export async function getDriverStandings() {
  try {
    const response = await fetch(`${BASE_URL}/current/driverStandings.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch driver standings");
    }

    const data = await response.json();

    return data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getConstructorStandings() {
  try {
    const response = await fetch(
      `${BASE_URL}/current/constructorStandings.json`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch constructor standings");
    }

    const data = await response.json();

    return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCurrentSchedule() {
  try {
    const response = await fetch(`${BASE_URL}/current.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch race schedule");
    }

    const data = await response.json();

    return data.MRData.RaceTable.Races;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getLastRaceResults() {
  try {
    const response = await fetch(`${BASE_URL}/current/last/results.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch race results");
    }

    const data = await response.json();

    return data.MRData.RaceTable.Races[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}
