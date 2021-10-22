import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const WAIDApi = createApi({
  reducerPath: "WAIDApi",
  baseQuery: fetchBaseQuery({ baseUrl: WAID_API }),
  endpoints: (builder) => ({
    authUser: builder.query({
      query: () => "/users/auth",
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
    getUserGuess: builder.query({
      query: ({ username, guessId }) => `users/${username}/guesses/${guessId}`,
      providesTags: (_res, _err, { guessId: id }) => [{ type: "Guesses", id }],
    }),
    updateUserGuess: builder.mutation({
      query: ({ _id, username, ...rest }) => ({
        url: `users/${username}/guesses/${_id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (_res, _err, { _id: id }) => [{ type: "Guesses", id }],
    }),
  }),
});
