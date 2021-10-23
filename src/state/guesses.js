import { useMemo } from "react";
import { useSelector } from "react-redux";

import { createSlice } from "@reduxjs/toolkit";

import { WAIDApi as api } from "./api.js";

const slice = createSlice({
  name: "guesses",
  initialState: {},
  reducers: {
    updateEntry: (draft, { payload: { guessId, entry, entryIndex } }) => {
      draft[guessId][entryIndex] = entry;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getUserGuesses.matchFulfilled,
      (draft, { payload }) => {
        payload.forEach((guess) => {
          draft[guess._id] = guess.entries;
        });
      }
    );
  },
});

export const useGuessEntries = (guessId) => {
  const entries = useSelector((state) => state[slice.name][guessId]);
  return useMemo(() => entries, [entries]);
};

export const { actions } = slice;

export default slice.reducer;
