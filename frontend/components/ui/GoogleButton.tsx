import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";

interface GoogleButtonProps {
  onClick: () => void;
}

export default function GoogleButton({
  onClick,
}: GoogleButtonProps) {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onClick}
      sx={{
        py: 1.5,
        borderRadius: 3,
      }}
    >
      Continue with Google
    </Button>
  );
}