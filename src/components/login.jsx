import React, { useState, useEffect } from "react";

import { useHistory } from 'react-router-dom';
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Checkbox from "@mui/material/Checkbox";
// import Link from "@mui/material/Link";
// import Grid from "@mui/material/Grid";

import useFetchStatus from '../hooks/useFetchStatus.js';
import { WAIDApi as api } from '../state/api.js';


// eslint-disable-next-line
const Login = () => {
  const history = useHistory();
  const [formCreds, setFormCreds] = useState({ username: '', password: '' });
  const [authUser, { isLoading, isSuccess, isError, error, data }] = api.endpoints.authUser.useMutation();

  const handleFormChange = (e) => setFormCreds({ ...formCreds, [e.target.name]: e.target.value});
  useEffect(() => {
    if (isSuccess) {
      history.push(`/u/${data.username}/dashboard`);
    }
  }, [isSuccess]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authUser(formCreds).unwrap();
    } catch {
      setFormCreds({...formCreds, password: '' });
    }
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          { isError && <Alert severity="error">{error.data}</Alert> }
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="username"
            autoComplete="email"
            required
            autoFocus
            value={formCreds.username}
            onChange={handleFormChange}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={formCreds.password}
            onChange={handleFormChange}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
