import React, { useState, useEffect } from "react";

import { Stack } from "@mui/material";

import api from "../state/api.js";
import { useAuth } from "../state/auth.js";

import Guess from "./guess.jsx";

const UserDashboard = () => {
  const [chartRefs, setChartRefs] = useState([]);
  const { username } = useAuth();
  const { data: breeds = [] } = api.endpoints.getBreedList.useQuery();

  const { data: guesses, isSuccess } =
    api.endpoints.getUserGuesses.useQuery(username);

  useEffect(() => {
    setChartRefs(guesses?.map(() => React.createRef()) || []);
  }, [guesses]);

  return (
    <Stack spacing={4} sx={{ padding: "20px" }}>
      {isSuccess &&
        guesses
          .slice(0, 1)
          .map((guess, guessIndex) => (
            <Guess
              key={`guess-${guess._id}`}
              guessId={guess._id}
              guessIndex={guessIndex}
              chartRef={chartRefs[guessIndex]}
              breeds={breeds}
            />
          ))}
    </Stack>
  );
};

export default UserDashboard;
