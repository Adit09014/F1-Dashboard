const BASE_URL = "https://api.openf1.org/v1";

export async function getSessionKey() {
  try {
    const response = await fetch(`${BASE_URL}/sessions`);

    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }

    const data = await response.json();

    const currentDate = new Date();

    let latestRace = null;

    for (const session of data) {
      const endDate = new Date(session.date_end);

      if (session.session_name === "Race" && endDate < currentDate) {
        latestRace = session;
      }
    }
    console.log(latestRace);
    return latestRace?.session_key;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getFastestPit(sessionId: number) {
  try {
    const response = await fetch(`${BASE_URL}/pit?session_key=${sessionId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch pit data");
    }

    const data = await response.json();

    const validPits = data.filter((pit: any) => pit.stop_duration !== null);

    if (!validPits.length) {
      return null;
    }

    const fastestPit = validPits.reduce((best: any, current: any) =>
      current.stop_duration < best.stop_duration ? current : best,
    );

    return fastestPit;
  } catch (error) {
    console.log(error);
    return null;
  }
}
