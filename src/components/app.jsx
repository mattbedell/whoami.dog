import React from 'react';

import { Switch, Route } from 'react-router-dom';
import { Provider as StoreProvider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { store } from '../state/store.js';
import Login from './login.jsx';
import UserPage from './userPage.jsx';
import UserDashboard from './userDashboard.jsx';
import { UserProvider } from '../util/userContext.jsx';

const theme = createTheme();

const App = () => (
  <ThemeProvider theme={theme}>
    <StoreProvider store={store}>
    <CssBaseline />
    <Switch>
      <Route path="/login">
        <UserProvider>
          <Login />
        </UserProvider>
      </Route>
      <Route path="/u/:username/dashboard">
        <UserProvider>
          <UserDashboard />
        </UserProvider>
      </Route>
      <Route path="/u/:username">
        <UserPage />
      </Route>
    </Switch>
    </StoreProvider>
  </ThemeProvider>
);

export default App;
