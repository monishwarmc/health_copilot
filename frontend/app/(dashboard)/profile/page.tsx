"use client"

import AuthCard from '@/components/ui/AuthCard'
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { useAuth } from "@/context/AuthContext";
import Button from '@mui/material/Button';
import Image from 'next/image';

import LogoutIcon from '@mui/icons-material/Logout';

function profile() {

  const { user, logout } = useAuth();

  // Helper function to format ISO date string to "Day, Date Time"
  const formatDateTimeDay = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      weekday: "long",   // e.g., "Saturday"
      year: "numeric",   // e.g., "2026"
      month: "short",    // e.g., "Jul"
      day: "numeric",    // e.g., "25"
      hour: "2-digit",   // e.g., "09"
      minute: "2-digit", // e.g., "50"
      second: "2-digit", // e.g., "41"
      hour12: true,      // e.g., "PM"
    });
  };

  return (
    <AuthCard
      title={""+user?.full_name}
      subtitle={""+user?.email}
    >
      <Stack
        direction={"column"}
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {user?.profile_picture && (
          <Image
            src={user.profile_picture}
            alt='profile pic'
            width={48}
            height={48}
            style={{ borderRadius: '50%' }} // Optional: makes it circular
          />
        )}
        <Typography variant="h6">
          {formatDateTimeDay(user?.created_at)}
        </Typography>
        <Typography variant="h6">
          {user?.id}
        </Typography>
      </Stack>
      <Button 
        color='warning'
        variant='contained'
        size='small'
        fullWidth
        sx={{
          alignSelf: "center"
        }}
        onClick={logout}
        endIcon={<LogoutIcon/>}
        >
          Logout
      </Button>
    </AuthCard>
  )
}

export default profile