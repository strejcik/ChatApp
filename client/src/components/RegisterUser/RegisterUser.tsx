import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authContext from "../../context/authContext";
import { registerUser } from "../../services/auth/authService";




import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';







  const defaultTheme = createTheme();

const Register = () => {
    
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const {  setAccountCreated, accountCreated } = useContext(authContext);

    const validateEmail = (email:any) => {
        const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      };


      useEffect(() => {
        if(accountCreated) {
            navigate("/login")
        }
    },[accountCreated])

    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);



      const userData = {
        email: data.get('email'),
        password: data.get('password'),
        confirmPassword: data.get('confirmPassword')
    };

    try {
        const passwd = (userData.password as string).toUpperCase();
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            throw new Error('Passwords do not match, Please try again')
        }
        if (!validateEmail(userData.email)) {
            setError('Invalid Email');
            throw new Error('Invalid Email, Please try again')
        }
        if (passwd.length < 8) {
            setError('Password must be at least 8 chars long');
            throw new Error('Password must be at least 8 chars long, Please try again')
        }
        registerUser(userData.email as string, userData.password as string, setAccountCreated);

    } catch (error:any) {
        // Handle any errors that occur during registration
        console.error("Registration error:", error.message);
        alert(error.message);
    }


    };
  
    return (
      <ThemeProvider theme={defaultTheme}>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
  backgroundImage:
                'url("https://images.pexels.com/photos/3297593/pexels-photo-3297593.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'left',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Register
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Register
                </Button>
                <Grid container>
                  <Grid item>
                    <Link variant="body2" onClick={() => navigate("/login")}>
                      {"Do you have an account? Sign In"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }


export default Register;