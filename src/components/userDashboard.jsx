import React, { useState, useEffect, useRef } from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";

import useFetchStatus from "../hooks/useFetchStatus.js";
import useFetch from "../hooks/useFetch.js";
// import { useUser } from "../util/userContext.jsx";

import GuessPie, { getLegendColor } from "./guessPie.jsx";
import Guess from "./guess.jsx";

const UserDashboard = () => {
  const [chartRefs, setChartRefs] = useState([]);
  const history = useHistory();
  const [{ data, statusCode }] = useFetch(
    `/api/guesses`,
    { redirect: "follow" },
    { doRequest: true },
    []
  );

  const [{ data: breeds }] = useFetch(`/api/breeds`, {}, { doRequest: true }, []);

  const [guesses, setGuesses] = useState(data);

  useEffect(() => {
    setGuesses(data);
    setChartRefs(data.map(() => React.createRef()));
  }, [data]);

  // TODO: this could be abstracted better, add redirect to here after login
  // ex /login?redirect=/this/url
  if (statusCode === 403) {
    history.push("/login");
  }

  return (
    <Stack spacing={4} sx={{ padding: "20px" }}>
      {guesses.slice(0, 1).map((guess, guessIndex) => (
        <Guess
          key={`guess-${guess._id}`}
          guess={guess}
          guessIndex={guessIndex}
          chartRef={chartRefs[guessIndex]}
          breeds={breeds}
        />
      ))}
    </Stack>
  );
};

export default UserDashboard;
