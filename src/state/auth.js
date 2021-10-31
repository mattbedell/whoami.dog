import { useMemo } from "react";
import { useSelector } from "react-redux";

import { createSlice } from "@reduxjs/toolkit";

import { WAIDApi as api } from "./api.js";

const placeholderState = { username: null, name: null };

let initialState = decodeURIComponent(document.cookie)
  .split("; ")
  .find((row) => row.startsWith("waid-user"))
  ?.replace(/^.*=j:/, '');

if (initialState) {
  try {
    const stored = JSON.parse(initialState);
    initialState = Object.keys(placeholderState).reduce((state, key) => ({
      ...state,
      [key]: stored[key],
    }), {});
  } catch {
    initialState = placeholderState;
  }
}

initialState = initialState || placeholderState;

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.authUser.matchFulfilled,
      (draft, { payload: { username, name } }) => {
        draft.username = username;
        draft.name = name;
      }
    );
  },
});

export const useAuth = () => {
  const user = useSelector((state) => state[slice.name]);
  return useMemo(() => user, [user]);
};

export default slice.reducer;
