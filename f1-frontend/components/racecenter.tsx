"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/services/jolpica";
import RaceCenterHeader from "./RaceCenter/RaceCenterHeader";
import RaceClassification from "./RaceCenter/Upcoming";




export default function RaceCenter() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSession();
        setSession(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>

      {session.status === "UPCOMING" && <RaceClassification />}
      {/* {session.status === "PRACTICE" && <PracticeView />}
      {session.status === "QUALI_DONE" && <QualiView />}
      {session.status === "LIVE" && <LiveRaceView />} */}
    </div>
  );
}