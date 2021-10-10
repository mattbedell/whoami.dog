import React, { forwardRef } from "react";

import {
  deepPurple,
  brown,
  lightBlue,
  amber,
  blueGrey,
  grey,
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

const generateChartData = (entries, guessIdx, remainingGuess) => {
  const labels = [];
  const generatedDataset = entries.reduce(
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

  generatedDataset.data.push(remainingGuess);
  generatedDataset.backgroundColor.push(grey[200]);
  generatedDataset.borderColor.push(grey[200]);
  labels.push("Unknown");

  return {
    labels,
    datasets: [generatedDataset],
  };
};

const GuessPie = forwardRef(
  ({ entries = [], guessIndex = 0, remainingGuess = 0 }, ref) => {
    const data = generateChartData(entries, guessIndex, remainingGuess);
    return (
      <Pie
        ref={ref}
        data={data}
        options={{
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.parsed}%`,
              },
            },
          },
        }}
      />
    );
  }
);

export default GuessPie;
