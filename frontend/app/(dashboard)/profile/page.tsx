"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import Image from "next/image";

import ProfileImageCropper from "@/components/profile/ProfileImageCropper";
import { useAuth } from "@/context/AuthContext";
import getErrorMessage from "@/lib/error";
import { uploadImage } from "@/services/cloudinary.service";

export default function ProfilePage() {
  const {
    user,
    logout,
    profile,
    password,
    account,
    googleVerify,
  } = useAuth();

  const isLocalUser =
    user?.auth_provider === "local";

  const [fullName, setFullName] =
    useState("");

  const [profilePicture, setProfilePicture] =
    useState("");

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [deletePassword, setDeletePassword] =
    useState("");

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [loadingPassword, setLoadingPassword] =
    useState(false);

  const [loadingDelete, setLoadingDelete] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [cropOpen, setCropOpen] =
    useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setProfilePicture(
      user?.profile_picture ?? ""
    );
  }, [
    user?.full_name,
    user?.profile_picture,
  ]);

  const firstLetter =
    fullName
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setCropOpen(true);

    e.target.value = "";
  };

  const handleCropComplete = async (
    croppedFile: File
  ) => {
    try {
      setUploading(true);

      const imageUrl =
        await uploadImage(croppedFile);

      await profile(
        fullName || null,
        imageUrl
      );

      setProfilePicture(imageUrl);

      toast.success(
        "Profile picture updated"
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setUploading(false);
      setCropOpen(false);
      setSelectedImage(null);
    }
  };

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const handleProfileUpdate =
    async () => {
      setLoadingProfile(true);

      try {
        await profile(
          fullName || null,
          profilePicture || null
        );

        toast.success(
          "Profile updated successfully"
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setLoadingProfile(false);
      }
    };

  const handlePasswordUpdate =
    async () => {
      if (
        !oldPassword ||
        !newPassword
      ) {
        toast.error(
          "Please enter both passwords."
        );
        return;
      }

      setLoadingPassword(true);

      try {
        const message =
          await password(
            oldPassword,
            newPassword
          );

        toast.success(message);

        setOldPassword("");
        setNewPassword("");
      } catch (error) {
        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setLoadingPassword(false);
      }
    };

  const handleDeleteAccount =
    async () => {
      if (
        isLocalUser &&
        !deletePassword
      ) {
        toast.error(
          "Enter your password to confirm account deletion."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete your account? This action cannot be undone."
        );

      if (!confirmed) return;

      setLoadingDelete(true);

      try {
        let message = "";

        if (isLocalUser) {
          message = await account(
            deletePassword,
            null
          );
        } else {
          const idToken =
            await googleVerify();

          message = await account(
            null,
            idToken
          );
        }

        toast.success(message);

        logout();
      } catch (error) {
        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setLoadingDelete(false);
      }
    };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      {/* PAGE HEADER */}

      <Stack
        spacing={0.5}
        sx={{
          mb: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Profile
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Manage your personal information
          and account security.
        </Typography>
      </Stack>

      {/* PROFILE HERO */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",

          mb: 3,

          borderRadius: {
            xs: 3,
            md: 4,
          },

          border: "1px solid",
          borderColor: "divider",

          background:
            "linear-gradient(135deg, rgba(33,150,243,0.12), rgba(33,150,243,0.025) 55%, transparent)",

          p: {
            xs: 2.5,
            sm: 3.5,
            md: 4,
          },

          "&::after": {
            content: '""',
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            right: -100,
            top: -130,
            background:
              "rgba(33,150,243,0.08)",
            filter: "blur(2px)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={3}
          sx={{
            alignItems: {
              xs: "center",
              sm: "center",
            },
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Avatar */}

          <Box
            sx={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Avatar
              sx={{
                width: {
                  xs: 100,
                  sm: 116,
                },

                height: {
                  xs: 100,
                  sm: 116,
                },

                fontSize: {
                  xs: "2.5rem",
                  sm: "3rem",
                },

                fontWeight: 800,

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                border: "4px solid",

                borderColor:
                  "background.paper",

                boxShadow:
                  "0 8px 30px rgba(33,150,243,0.25)",

                overflow: "hidden",
              }}
            >
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  alt="Profile picture"
                  width={116}
                  height={116}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                firstLetter
              )}
            </Avatar>

            <Button
              component="label"
              variant="contained"
              size="small"
              disabled={uploading}
              sx={{
                position: "absolute",

                right: -4,
                bottom: -4,

                minWidth: 38,
                width: 38,
                height: 38,

                borderRadius: "50%",

                p: 0,

                boxShadow:
                  "0 4px 14px rgba(0,0,0,0.2)",

                "& .MuiButton-startIcon": {
                  m: 0,
                },
              }}
            >
              {uploading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CameraAltOutlinedIcon
                  fontSize="small"
                />
              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
              />
            </Button>
          </Box>

          {/* User information */}

          <Stack
            spacing={1}
            sx={{
              minWidth: 0,
              textAlign: {
                xs: "center",
                sm: "left",
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.025em",
                wordBreak: "break-word",
              }}
            >
              {user?.full_name ||
                "Your Name"}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: {
                  xs: "center",
                  sm: "flex-start",
                },
                color:
                  "text.secondary",
              }}
            >
              <EmailOutlinedIcon
                sx={{
                  fontSize: 18,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  wordBreak:
                    "break-word",
                }}
              >
                {user?.email}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: {
                  xs: "center",
                  sm: "flex-start",
                },
                color:
                  "text.secondary",
              }}
            >
              <CalendarTodayOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />

              <Typography
                variant="body2"
              >
                Member since{" "}
                {formatDate(
                  user?.created_at
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* PERSONAL INFORMATION */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },

          border: "1px solid",
          borderColor: "divider",

          mb: 3,

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  "rgba(33,150,243,0.10)",
                color:
                  "primary.main",
              }}
            >
              <PersonIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 750,
                }}
              >
                Personal information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Update how your account
                appears across Health
                Copilot.
              </Typography>
            </Box>
          </Stack>

          <TextField
            label="Full name"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
            fullWidth
            sx={{
              mb: 2.5,
            }}
          />

          <TextField
            label="Email"
            value={user?.email ?? ""}
            fullWidth
            disabled
            helperText="Your email address is managed by your authentication provider."
          />

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: {
                xs: "stretch",
                sm: "flex-end",
              },
            }}
          >
            <Button
              variant="contained"
              startIcon={
                loadingProfile ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveOutlinedIcon />
                )
              }
              disabled={
                loadingProfile ||
                uploading
              }
              onClick={
                handleProfileUpdate
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 190,
                },
                borderRadius: 2.5,
                py: 1.2,
                fontWeight: 700,
              }}
            >
              {loadingProfile
                ? "Saving..."
                : "Save changes"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ACCOUNT SECURITY */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },

          border: "1px solid",
          borderColor: "divider",

          mb: 3,

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  "rgba(156,39,176,0.10)",
                color:
                  "secondary.main",
              }}
            >
              <SecurityOutlinedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 750,
                }}
              >
                Account security
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Keep your account secure.
              </Typography>
            </Box>
          </Stack>

          {isLocalUser ? (
            <Stack spacing={2.5}>
              <TextField
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(e) =>
                  setOldPassword(
                    e.target.value
                  )
                }
                fullWidth
              />

              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                fullWidth
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "stretch",
                    sm: "flex-end",
                  },
                }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={
                    loadingPassword ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <LockResetOutlinedIcon />
                    )
                  }
                  disabled={
                    loadingPassword
                  }
                  onClick={
                    handlePasswordUpdate
                  }
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 190,
                    },
                    borderRadius: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                  }}
                >
                  {loadingPassword
                    ? "Updating..."
                    : "Change password"}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor:
                  "action.hover",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                You signed in using
                Google. Password
                management is handled by
                your Google account.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ACCOUNT ACTIONS */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },

          border: "1px solid",
          borderColor:
            "rgba(211,47,47,0.25)",

          overflow: "hidden",

          mb: 3,

          bgcolor:
            "rgba(211,47,47,0.025)",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 750,
              color: "error.main",
            }}
          >
            Danger zone
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            These actions affect your
            account permanently. Please
            proceed carefully.
          </Typography>

          {isLocalUser && (
            <TextField
              label="Password"
              type="password"
              value={deletePassword}
              onChange={(e) =>
                setDeletePassword(
                  e.target.value
                )
              }
              fullWidth
              sx={{
                mb: 2,
              }}
            />
          )}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={
                loadingDelete ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <DeleteForeverOutlinedIcon />
                )
              }
              disabled={loadingDelete}
              onClick={
                handleDeleteAccount
              }
              sx={{
                borderRadius: 2.5,
                py: 1.15,
                fontWeight: 700,
                flex: {
                  xs: 1,
                  sm: "initial",
                },
              }}
            >
              {loadingDelete
                ? "Deleting..."
                : "Delete account"}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={
                <LogoutOutlinedIcon />
              }
              onClick={logout}
              sx={{
                borderRadius: 2.5,
                py: 1.15,
                fontWeight: 700,
              }}
            >
              Sign out
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* IMAGE CROPPER */}

      <ProfileImageCropper
        open={cropOpen}
        image={selectedImage}
        onCancel={() => {
          setCropOpen(false);
          setSelectedImage(null);
        }}
        onSave={handleCropComplete}
      />
    </Box>
  );
}