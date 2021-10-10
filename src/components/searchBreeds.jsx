import React, { useState, useEffect, useRef } from "react";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// eslint-disable-next-line
const SearchBreeds = ({ breeds = [] }) => {
  return <Autocomplete
    options={breeds}
    getOptionLabel={({ title }) => title}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Add a breed"
        inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
      />
      )}
  />
};

export default SearchBreeds;
