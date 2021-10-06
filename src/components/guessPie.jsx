import React, { forwardRef } from "react";

import {
  deepPurple,
  brown,
  lightBlue,
  amber,
  blueGrey,
} from "@mui/material/colors";
import { Pie } from "react-chartjs-2";

const colors = [
  deepPurple[400],
  lightBlue[400],
  brown[500],
  amber[500],
  blueGrey[500],
];

export const getLegendColor = (guessIndex, entryIndex) =>
  colors[(guessIndex + entryIndex) % colors.length];

const generateChartData = (guess, guessIdx) => {
  const labels = [];
  const generatedDataset = guess.entries.reduce(
    (dataset, entry, i) => {
      const color = getLegendColor(guessIdx, i);
      dataset.data.push(entry.percentage);
      dataset.backgroundColor.push(color);
      dataset.borderColor.push(color);
      labels.push(entry.title);

      return dataset;
    },
    {
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }
  );

  return {
    labels,
    datasets: [generatedDataset],
  };
};

const GuessPie = forwardRef(({ guess, guessIndex = 0 }, ref) => {
  const data = generateChartData(guess, guessIndex);
  return (
    <Pie
      ref={ref}
      data={data}
      options={{ plugins: { legend: { display: false } } }}
    />
  );
});

export default GuessPie;
