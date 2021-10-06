import React, { useState, useEffect, useRef } from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

import useFetchStatus from "../hooks/useFetchStatus.js";
import useFetch from "../hooks/useFetch.js";
// import { useUser } from "../util/userContext.jsx";

import GuessPie, { getLegendColor } from "./guessPie.jsx";

const UserDashboard = () => {
  const theme = useTheme();
  const [chartRefs, setChartRefs] = useState([]);
  const history = useHistory();
  const { data, statusCode } = useFetch(
    `/api/guesses`,
    { redirect: "follow" },
    []
  );

  const [guesses, setGuesses] = useState(data)

  useEffect(() => {
    setGuesses(data)
    setChartRefs(data.map(() => React.createRef()));
  }, [data]);

  // TODO: this could be abstracted better, add redirect to here after login
  // ex /login?redirect=/this/url
  if (statusCode === 403) {
    history.push("/login");
  }

  // useEffect(() => {

  // }, [guesses])

  return (
    <Stack spacing={4} sx={{ padding: '20px' }}>
      {guesses.slice(0, 1).map((guess, guessIndex) => (
        <Paper key={`guess-${guess._id}`} variant="outlined" sx={{ padding: '15px', backgroundColor: theme.palette.grey[100] }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Card sx={{ width: '100%', padding: '20px' }}>
                <GuessPie ref={chartRefs[guessIndex]} guess={guess} guessIndex={guessIndex} />
              </Card>
            </Box>
            <Box sx={{ width: '50%' }}>
              <Stack spacing={1}>
                {guess.entries.map((entry, j) => (
                  <Card
                    key={`guess-${guess._id}-entry-${entry._id}`}
                    sx={{ display: "flex" }}
                    onMouseEnter={() => {
                      const chart = chartRefs[guessIndex].current;
                      const { tooltip } = chart;
                      chart.setActiveElements([{ datasetIndex: 0, index: j }])
                      tooltip.setActiveElements([{ datasetIndex: 0, index: j }])
                      chart.update();
                    }}
                    onMouseLeave={() => {
                      const chart = chartRefs[guessIndex].current;
                      const { tooltip } = chart;
                      chart.setActiveElements([])
                      tooltip.setActiveElements([])
                      chart.update();
                  }}
                  >
                    <Box sx={{ width: "2%", backgroundColor: getLegendColor(guessIndex, j)}} />
                    <CardMedia
                      component="img"
                      image={entry.imgSrc}
                      sx={{  width: "30%" }}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <CardContent>
                        <Typography component="div" variant="h5">
                          {entry.title}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default UserDashboard;
