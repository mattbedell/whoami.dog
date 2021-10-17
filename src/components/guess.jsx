import React, { useState, useEffect, useCallback } from "react";

import { useTheme, styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";

import useFetch from "../hooks/useFetch.js";
import GuessPie, { getLegendColor } from "./guessPie.jsx";
import SearchBreeds from "./searchBreeds.jsx";

const CustomSlider = styled(Slider)(() => ({
  "& .MuiSlider-mark": {
    backgroundColor: "#bfbfbf",
    height: 8,
    opacity: 1,
    width: 2,
  },
}));

export const GuessEntry = ({
  entry,
  handleChange = () => {},
  onMouseEnter,
  onMouseLeave,
  sliderEnabled,
  saveEntries,
  remainingGuess,
}) => {
  const [percentage] = useState(entry.percentage);

  return (
    <Grid
      item
      key={`guess-entry-${entry._id}`}
      xs={12}
      sm={6}
      md={6}
      sx={{ flexGrow: 2 }}
      onPointerEnter={onMouseEnter}
      onPointerLeave={onMouseLeave}
    >
      <Card sx={{ display: "flex", flexDirection: "column" }}>
        <CardMedia component="img" image={entry.imgSrc} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {entry.title}
          </Typography>
          {/* <Typography>{entry.summary}</Typography> */}
        </CardContent>
        <CardActions>
          <CustomSlider
            defaultValue={percentage}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}%`}
            value={entry.percentage}
            onChange={handleChange}
            disabled={!sliderEnabled}
            marks={[{ value: entry.percentage + remainingGuess }]}
            onPointerUp={() => {
              saveEntries();
            }}
          />
        </CardActions>
      </Card>
    </Grid>
  );
};

const Guess = ({ guess, guessIndex, chartRef, breeds }) => {
  const theme = useTheme();
  const [entries, setEntries] = useState(guess.entries);

  const [{ data, status }, putGuessEntries] = useFetch(
    `${WAID_API}/guess/${guess._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const saveEntries = useCallback(() => {
    putGuessEntries({ body: JSON.stringify({ guess: { ...guess, entries: entries.map(({ breedId, percentage }) => ({ breedId, percentage })) } }) });
  }, [entries, guess, putGuessEntries]);

  const remainingGuess = Math.max(
    entries.reduce((remaining, entry) => remaining - entry.percentage, 100),
    0
  );

  return (
    <Container
      key={`guess-${guess._id}`}
      variant="outlined"
      sx={{ padding: "15px", backgroundColor: theme.palette.grey[100] }}
    >
      <SearchBreeds breeds={breeds} />
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card sx={{ width: "100%", padding: "20px" }}>
            <GuessPie
              ref={chartRef}
              entries={entries}
              guessIndex={guessIndex}
              remainingGuess={remainingGuess}
            />
          </Card>
        </Box>
        <Container maxWidth="md">
          <Grid container spacing={4}>
            {entries.map((entry, entryIndex) => (
              <GuessEntry
                key={`entry-${entry._id}`}
                entry={entry}
                sliderEnabled={!status.loading}
                saveEntries={saveEntries}
                remainingGuess={remainingGuess}
                handleChange={(e) => {
                  let remaining = 100;
                  const newEntries = entries.map((uEntry, i) => {
                    let newEntry = uEntry;
                    if (i === entryIndex) {
                      newEntry = { ...uEntry, percentage: e.target.value };
                    }
                    remaining -= newEntry.percentage;
                    return newEntry;
                  });

                  if (remaining < 0) {
                    return;
                  }

                  setEntries(newEntries);
                  chartRef.current.tooltip.update();
                }}
                onMouseEnter={() => {
                  const chart = chartRef.current;
                  const { tooltip } = chart;
                  chart.setActiveElements([
                    { datasetIndex: 0, index: entryIndex },
                  ]);
                  tooltip.setActiveElements([
                    { datasetIndex: 0, index: entryIndex },
                  ]);
                  chart.update();
                }}
                onMouseLeave={() => {
                  const chart = chartRef.current;
                  const { tooltip } = chart;
                  chart.setActiveElements([]);
                  tooltip.setActiveElements([]);
                  chart.update();
                }}
              />
            ))}
          </Grid>
        </Container>
      </Stack>
    </Container>
  );
};

export default Guess;
