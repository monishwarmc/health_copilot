import Image from "next/image";
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: "primary" | "secondary" | "inherit";
}

export default function Logo({
  size = 48,
  showText = true,
  textColor="primary",
}: LogoProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{alignItems:"center"}}
    >
      <Image
        src="/logo.png"
        alt="HealthCopilot Logo"
        width={size}
        height={size}
      />

      {showText && (
        <Typography
          variant="h5"
          color={textColor}
          sx={{fontWeight: 700}}
        >
          Health Copilot
        </Typography>
      )}
    </Stack>
  );
}