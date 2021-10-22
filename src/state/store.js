import { configureStore } from '@reduxjs/toolkit';

import { setupListeners } from '@reduxjs/toolkit/query';

import { WAIDApi } from './api.js';

export const store = configureStore({
  reducer: {
    [WAIDApi.reducerPath]: WAIDApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>  getDefaultMiddleware().concat(WAIDApi.middleware),
});

setupListeners(store.dispatch);

