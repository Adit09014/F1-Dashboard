import next from "next";

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

    const races = data.MRData.RaceTable.Races;

    const currentDate = new Date();

    for (let i = 0; i < races.length; i++) {
      const race = races[i];

      const sessions = [
        {
          name: "First Practice",
          ...race.FirstPractice,
        },
        {
          name: "Second Practice",
          ...race.SecondPractice,
        },
        race.ThirdPractice && {
          name: "Third Practice",
          ...race.ThirdPractice,
        },
        {
          name: "Qualifying",
          ...race.Qualifying,
        },
        race.Sprint && {
          name: "Sprint",
          ...race.Sprint,
        },
        {
          name: "Race",
          date: race.date,
          time: race.time,
          raceName: race.raceName,
        },
      ].filter(Boolean);

      for (const session of sessions) {
        const sessionDate = new Date(`${session.date}T${session.time}`);

        if (sessionDate > currentDate) {
          return {
            ...session,
            raceName: race.raceName,
            circuit: race.Circuit.circuitName,
            country: race.Circuit.Location.country,
            circuitId: race.Circuit.circuitId,
            lat: race.Circuit.Location.lat,
            long: race.Circuit.Location.long,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
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

export async function lastYearWinner(race: any) {
  try {
    const circuitId = race.circuitId;

    const response = await fetch(
      `${BASE_URL}/2025/circuits/${circuitId}/results.json`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch last year winner");
    }

    const data = await response.json();

    const winner = data.MRData.RaceTable.Races[0].Results[0];

    return winner;
  } catch (error) {
    console.error(error);
    return null;
  }
}
