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

export async function getSession() {
  try {
    const response = await fetch(`${BASE_URL}/current.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch race schedule");
    }

    const data = await response.json();

    const races = data.MRData.RaceTable.Races;

    const now = new Date();

    for (const race of races) {
      const sessions = [
        {
          type: "FP1",
          ...race.FirstPractice,
        },
        {
          type: "FP2",
          ...race.SecondPractice,
        },
        race.ThirdPractice && {
          type: "FP3",
          ...race.ThirdPractice,
        },
        {
          type: "Qualifying",
          ...race.Qualifying,
        },
        race.Sprint && {
          type: "Sprint",
          ...race.Sprint,
        },
        {
          type: "Race",
          date: race.date,
          time: race.time,
        },
      ].filter(Boolean);

      for (const session of sessions) {
        const start = new Date(`${session.date}T${session.time}`);

        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

        // LIVE SESSION
        if (now >= start && now <= end) {
          return {
            status: "LIVE",
            session: session.type,
            raceName: race.raceName,
            country: race.Circuit.Location.country,
          };
        }

        // UPCOMING SESSION
        if (start > now) {
          return {
            status: "UPCOMING",
            session: session.type,
            raceName: race.raceName,
            date: start,
            country: race.Circuit.Location.country,
          };
        }
      }
    }

    // NO ACTIVE WEEKEND
    return {
      status: "IDLE",
    };
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

export async function getData() {
  try {
    const response = await fetch(`${BASE_URL}/current/last/results.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch race schedule");
    }

    const data = await response.json();

    const races = data.MRData.RaceTable.Races;
    const result = races[0].Results;

    for (const res of result) {
      if (res.FastestLap.rank === "1") {
        return res;
      }
    }
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

export async function getBiggestClimber() {
  try {
    const response = await fetch(`${BASE_URL}/current/last/results.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch race results");
    }

    const data = await response.json();

    const results = data.MRData.RaceTable.Races[0].Results;

    let biggestClimber = results[0];

    let maxGain = -999;

    for (const driver of results) {
      const grid = parseInt(driver.grid);

      const finish = parseInt(driver.position);

      const gain = grid - finish;

      if (gain > maxGain) {
        maxGain = gain;
        biggestClimber = {
          ...driver,
          gain,
        };
      }
    }

    return biggestClimber;
  } catch (error) {
    console.error(error);
    return null;
  }
}
