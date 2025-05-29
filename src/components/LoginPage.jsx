import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Link,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import credentials from '../assets/username_password.json';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const passwordRef = useRef(null);

  const handleClickShow = () => {
    if (passwordRef.current) {
      const pos = passwordRef.current.selectionStart;
      setShowPassword((s) => !s);
      setTimeout(() => {
        passwordRef.current.focus();
        passwordRef.current.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setShowPassword((s) => !s);
    }
  };
  const handleMouseDown = (e) => e.preventDefault();

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUser = credentials.find(
      (c) => c.username === username && c.password === password
    );
    if (validUser) {
      // Tell App.jsx we’re authenticated
      onLogin(rememberMe);
    } else {
      alert('Invalid username or password.');
    }
  };

  const handleRecovery = () => {
    setRecoverySubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0053BC 0%, #00285E 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          {/* logo + heading */}
          <Box
            component="img"
            src="https://www.mavs.com/wp-content/themes/mavs/images/logo.svg"
            alt="Mavericks Logo"
            sx={{ width: 60, height: 60, mb: 3 }}
          />
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
            Enter the 2025 NBA Draft
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The Maverick Way
          </Typography>

          {/* normal login */}
          {!forgotMode && (
            <>
              <TextField
                id="username"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                id="password"
                label="Password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputRef={passwordRef}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                sx={{ mb: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShow}
                        onMouseDown={handleMouseDown}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
                sx={{ alignSelf: 'flex-start', mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mb: 2 }}
              >
                Enter
              </Button>

              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setForgotMode(true);
                  setRecoverySubmitted(false);
                }}
              >
                Forgot your credentials?
              </Link>
            </>
          )}

          {/* recovery mode */}
          {forgotMode && (
            <>
              <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setForgotMode(false)}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <ArrowBack fontSize="small" sx={{ mr: 0.5 }} />
                  Back to Login
                </Link>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 2, px: 2 }}
              >
                If we find your username/email, we will send you reset instructions.
              </Typography>

              {!recoverySubmitted && (
                <>
                  <TextField
                    id="recovery"
                    fullWidth
                    placeholder="Username or email"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRecovery()}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleRecovery}
                  >
                    Submit
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
