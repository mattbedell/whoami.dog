import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSlice } from "@reduxjs/toolkit";

import { WAIDApi as api } from "./api.js";

const slice = createSlice({
  name: "auth",
  initialState: { username: null, name: null },
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
}

export default slice.reducer;

