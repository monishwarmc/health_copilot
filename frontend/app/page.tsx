"use client"

import Button from "@mui/material/Button";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LoginIcon from '@mui/icons-material/Login';
import Stack from "@mui/material/Stack";
import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <Stack
    direction={"row"}
    spacing={100}
    sx={{
      justifyContent:"center",
      py:"3vh"
    }}
    >
      <Logo/>
      <Stack
      direction={"row"}
      spacing={3}
      >
        <Button
            variant="outlined"
            href="/login"
            size="small"
            endIcon={<LoginIcon/>}
        >Login</Button>
        <Button
            variant="outlined"
            href="/register"
            size="small"
            endIcon={<PersonAddAltIcon/>}
        >Register</Button>
      </Stack>
    </Stack>
  );
}
