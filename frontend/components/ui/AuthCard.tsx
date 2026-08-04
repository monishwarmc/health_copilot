import { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container, { ContainerProps } from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Logo from "./Logo";

interface AuthCardProps {
  title: string;
  subtitle: string;
  maxwidth?: ContainerProps["maxWidth"];
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  maxwidth = "sm",
  children,
}: AuthCardProps) {
  return (
    <Container maxWidth={maxwidth}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          elevation={4}
          sx={{
            width: "100%",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              spacing={3}
            >
              <Stack
                spacing={1}
                sx={{
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Logo />

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
                >
                  {title}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  {subtitle}
                </Typography>
              </Stack>

              {children}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}