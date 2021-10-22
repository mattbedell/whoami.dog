import React, { useState, useEffect, useRef } from "react";

import {
  TextField,
  Autocomplete,
  Box,
  Popper,
  Fade,
  Typography,
  Paper,
} from "@mui/material";

import {
  usePopupState,
  bindPopper,
  bindHover,
} from "material-ui-popup-state/hooks";

const SearchOption = ({ option, ...rest }) => {
  const popupState = usePopupState({
    variant: "popper",
    popupId: `li-breed-${option._id}`,
  });

  return (
    <Box component="li" {...rest} {...bindHover(popupState)}>
      <div>{option.title}</div>
      <Popper {...bindPopper(popupState)} disablePortal transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box>Heloooooooooooooooooooooo</Box>
          </Fade>
        )}
      </Popper>
    </Box>
    // <Box component="li" {...rest} {...bindHover(popupState)}>
    //   <div>{option.title}</div>
    //   <Popper {...bindPopper(popupState)} disablePortal>
    //     <Box>Hello world</Box>
    //   </Popper>
    // </Box>
  );
};

// eslint-disable-next-line
const SearchBreeds = ({ breeds = [] }) => {
  return (
    <Autocomplete
      options={breeds}
      getOptionLabel={({ title }) => title}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Add a breed"
          inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
        />
      )}
      renderOption={(props, option) => (
        <SearchOption {...props} option={option} />
      )}
    />
  );
};

export default SearchBreeds;
