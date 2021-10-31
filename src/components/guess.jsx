import React, { useState } from "react";
import { useDispatch } from "react-redux";

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

import api from "../state/api.js";
import { useAuth } from "../state/auth.js";
import { useGuessEntries, actions as guessActions } from "../state/guesses";
import GuessPie from "./guessPie.jsx";
import SearchBreeds from "./searchBreeds.jsx";
import { BreedCard } from "./breed.jsx";

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
  onPointerUp = () => {},
  sliderEnabled,
  remainingGuess,
}) => {
  const [percentage] = useState(entry.percentage);

  return (
    <Grid
      item
      key={`guess-entry-${entry.breedId}`}
      xs={12}
      sm={6}
      md={6}
      sx={{ flexGrow: 2 }}
      onPointerEnter={onMouseEnter}
      onPointerLeave={onMouseLeave}
    >
      <BreedCard breedId={entry.breedId}>
        <CardActions>
          <CustomSlider
            defaultValue={percentage}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}%`}
            value={entry.percentage}
            onChange={handleChange}
            disabled={!sliderEnabled}
            marks={[{ value: entry.percentage + remainingGuess }]}
            onPointerUp={onPointerUp}
          />
        </CardActions>
      </BreedCard>
    </Grid>
  );
};

const Guess = ({ guessId, guessIndex, chartRef, breeds }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { username } = useAuth();
  const entries = useGuessEntries(guessId);

  const [updateEntries, { isLoading: isUpdateLoading, isError, error }] =
    api.endpoints.updateUserGuess.useMutation();

  const { isFetching: isGuessFetching } = api.endpoints.getUserGuesses.useQuery(
    username,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: data?.find(({ _id }) => _id === guessId),
        ...rest,
      }),
    }
  );

  const remainingGuess = Math.max(
    entries?.reduce((remaining, entry) => remaining - entry.percentage, 100),
    0
  );

  return (
    <Container
      key={`guess-${guessId}`}
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
                key={`entry-${guessId}-${entry.breedId}`}
                entry={entry}
                sliderEnabled={!(isGuessFetching || isUpdateLoading)}
                remainingGuess={remainingGuess}
                handleChange={(e) => {
                  if (remainingGuess + entry.percentage - e.target.value < 0) {
                    return;
                  }

                  chartRef.current.tooltip.update();
                  dispatch(
                    guessActions.updateEntry({
                      entry: { ...entry, percentage: e.target.value },
                      guessId,
                      entryIndex,
                    })
                  );
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
                onPointerUp={() => {
                  updateEntries({ username, guessId, entries });
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
