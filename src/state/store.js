import { configureStore } from '@reduxjs/toolkit';

import { setupListeners } from '@reduxjs/toolkit/query';

import { WAIDApi } from './api.js';
import auth from './auth.js';
import guesses from './guesses.js';

export const store = configureStore({
  reducer: {
    [WAIDApi.reducerPath]: WAIDApi.reducer,
    auth,
    guesses,
  },
  middleware: (getDefaultMiddleware) =>  getDefaultMiddleware().concat(WAIDApi.middleware),
  devTools: process.env.NODE_ENV === 'development',
});

setupListeners(store.dispatch);

