import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const WAIDApi = createApi({
  reducerPath: "WAIDApi",
  baseQuery: fetchBaseQuery({ baseUrl: WAID_API }),
  endpoints: (builder) => ({
    authUser: builder.mutation({
      query: (credentials) => ({
        url: "/users/auth",
        method: "POST",
        body: credentials,
      }),
    }),
    getBreedList: builder.query({
      query: () => "breeds",
      keepUnusedDataFor: 3600,
    }),
    getBreed: builder.query({
      query: (breedId) => `breeds/${breedId}`,
      keepUnusedDataFor: 3600,
    }),
    getUserGuesses: builder.query({
      query: (username) => `users/${username}/guesses`,
      providesTags: (result = []) => [
        ...result.map(({ _id: id }) => ({ type: "Guesses", id })),
        { type: "Guesses", id: "LIST" },
      ],
    }),
    updateUserGuess: builder.mutation({
      query: ({ username, guessId, entries }) => ({
        url: `users/${username}/guesses/${guessId}`,
        method: "PUT",
        body: { entries },
      }),
      invalidatesTags: (_res, _err, { _id: id }) => [{ type: "Guesses", id }],
    }),
  }),
});

export default WAIDApi;
