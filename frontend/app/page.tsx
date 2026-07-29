"use client";

import Button from "@mui/material/Button";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";
import Stack from "@mui/material/Stack";
import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <Stack 
      direction="row" 
      sx={{ 
        justifyContent: "space-between", 
        alignItems: "center",
        py: "3vh",
        px: { xs: 2, sm: 4, md: 8 }, // Dynamic padding prevents screen edge hugging
        width: "100%",
        maxWidth: "1200px", // Prevents header from stretching too wide on massive screens
        mx: "auto" // Centers the entire header container
      }}
    >
      <Logo />
      <Stack direction="column" spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Button 
          variant="outlined" 
          href="/login" 
          size="small" 
          endIcon={<LoginIcon />}
        >
          Login
        </Button>
        <Button 
          variant="contained" 
          href="/register" 
          size="small" 
          endIcon={<PersonAddAltIcon />}
        >
          Register
        </Button>
      </Stack>
    </Stack>
  );
}
