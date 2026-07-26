"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

export default function Loading(
  {title = ""}: {title?:string} 
) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", // Centers within parent card/container. Use '100vh' for whole screen.
        gap: 2,
      }}
    >
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        Loading {title}...
      </Typography>
      <LinearProgress 
      color="primary" 
      aria-label="Loading…"
      sx={{
        width:"50vw"
      }}
      />
    </Box>
  );
}
