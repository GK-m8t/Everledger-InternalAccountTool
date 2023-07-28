import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import logo from '../assets/everledger-logo.png';
import del from '../assets/delete.svg';
import Image from 'next/image'
import { convertFileToJSON } from '../utils/fileUpload';
import { createSignup } from '../utils/createAccount';
import { listGroups, addUserToGroup,resetCognitoPassword } from '../utils/cognito';

const theme = createTheme();

function Home() {
  const [roles, setroles] = useState([]);
  const [rolesList, setrolesList] = useState([]);
  const [json, setJson] = useState(null);
  const [fileFlag, setFileFlag] = useState(0);

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      const jsonData = await convertFileToJSON(file);
      setJson(jsonData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = (event) => {
    const { value } = event.target;
    setroles(value);
  };

  const populateRolesDropdown = async () => {
    const roleListData = await listGroups();
    setrolesList(roleListData);
  };

  useEffect(() => {
    populateRolesDropdown();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let username_new = "";
    if (json) {
      for (let signupData of json) {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (signupData["E-Mail"].match(validRegex)) {
          let roleReadStatus = true
          const rolesArray = signupData["Role(s)"].split(",").map(group => {
            const result = rolesList.find(item => group.replace("(main role)", "").trim().replace(/jewellery-producer/i, 'Manufacturer').toLowerCase() === item.toLowerCase())
            if (!result) { roleReadStatus = false }
            return result
          });
          if (roleReadStatus) {
            rolesArray.push("business")
            username_new = await createSignup(signupData["E-Mail"], rolesArray[0], signupData["Company"], signupData["Service Country"], signupData["Residence Country"])
            if (username_new) {
              for (let requiredRole of rolesArray) {
                addUserToGroup(requiredRole, username_new)
              }
              alert("Successfully created signup")
            } else {
              alert("Failed to create signup")
            }
          } else {
            alert("Please upload the correct roles")
          }
        } else {
          alert("Please upload the correct email ID")
        }
      }
    } else {
      username_new = await createSignup(data.get('email'), 'Trader', data.get('companyName'), data.get('serviceCountry'), data.get('residenceCountry'))
      if (username_new) {
        for (let requiredRole of roles) {

          addUserToGroup(requiredRole, username_new)
        }
        alert("Successfully created signup")
      } else {
        alert("Failed to create signup")
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }} >
            <Image src={logo} alt="" className="" width={40} height={40} />
          </Avatar>
          <Typography component="h1" variant="h5">
            GGL Signup
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <OutlinedInput
                  fullWidth
                  id="bulkupload"
                  key={fileFlag}
                  type="file"
                  name="bulkupload"
                  onChange={handleFileUpload}
                  endAdornment={
                    <InputAdornment position="end">
                      <Image src={del} alt="" className="" onClick={() => { setJson(null); setFileFlag(1) }} />
                    </InputAdornment>
                  }
                />
              </Grid>
            </Grid>
            <br />
            {!json ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel required fullWidth id="role-label">Role(s)</InputLabel>
                  <Select
                    required
                    fullWidth
                    labelId="role-label"
                    id="role"
                    multiple
                    value={roles}
                    onChange={handleRoleChange}
                    input={<OutlinedInput label="Role(s)" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {rolesList.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={roles.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="companyName"
                    label="Company Name"
                    id="companyName"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="residenceCountry"
                    required
                    fullWidth
                    id="residenceCountry"
                    label="Residence Country"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="serviceCountry"
                    label="Service Country"
                    name="serviceCountry"
                    autoFocus
                  />
                </Grid>
              </Grid>) : (
              <></>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Home;
