import React from 'react';

import { Switch, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Login from './login.jsx';
import UserPage from './userPage.jsx';

const theme = createTheme();

const App = () => (
  <ThemeProvider theme={theme}>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/u/:username">
        <UserPage />
      </Route>
    </Switch>
  </ThemeProvider>
);

export default App;
