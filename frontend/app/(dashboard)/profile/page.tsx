"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import Image from "next/image";

import ProfileImageCropper from "@/components/profile/ProfileImageCropper";
import { useAuth } from "@/context/AuthContext";
import getErrorMessage from "@/lib/error";
import { uploadImage } from "@/services/cloudinary.service";

import type {
  ActivityLevel,
  DietPreference,
  Gender,
  Goal,
} from "@/types/user";

/* ============================================================
   HELPERS
============================================================ */

const genderLabels: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const activityLabels: Record<
  ActivityLevel,
  string
> = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Active",
  very_active: "Very active",
};

const goalLabels: Record<Goal, string> = {
  lose_weight: "Lose weight",
  gain_weight: "Gain weight",
  build_muscle: "Build muscle",
  maintain: "Maintain weight",
};

const dietLabels: Record<
  DietPreference,
  string
> = {
  none: "No preference",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
  pescatarian: "Pescatarian",
};

const formatDate = (
  date?: string | null
) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

const formatDateInput = (
  date?: string | null
) => {
  if (!date) {
    return "";
  }

  return date.slice(0, 10);
};

/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
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
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          color: "text.secondary",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 650,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

/* ============================================================
   PAGE
============================================================ */

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

  /* ============================================================
     PROFILE STATE
  ============================================================ */

  const [editing, setEditing] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [profilePicture, setProfilePicture] =
    useState("");

  const [heightCm, setHeightCm] =
    useState("");

  const [gender, setGender] =
    useState<Gender>("other");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [
    activityLevel,
    setActivityLevel,
  ] =
    useState<ActivityLevel>("sedentary");

  const [goal, setGoal] =
    useState<Goal>("maintain");

  const [
    dietPreference,
    setDietPreference,
  ] =
    useState<DietPreference>("none");

  const [
    medicalConditions,
    setMedicalConditions,
  ] = useState("");

  const [
    foodAllergies,
    setFoodAllergies,
  ] = useState("");

  const [bio, setBio] =
    useState("");

  /* ============================================================
     SECURITY STATE
  ============================================================ */

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [deletePassword, setDeletePassword] =
    useState("");

  /* ============================================================
     LOADING
  ============================================================ */

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [loadingPassword, setLoadingPassword] =
    useState(false);

  const [loadingDelete, setLoadingDelete] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  /* ============================================================
     IMAGE CROP
  ============================================================ */

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [cropOpen, setCropOpen] =
    useState(false);

  /* ============================================================
     SYNC USER -> FORM
  ============================================================ */

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(
      user.full_name ?? ""
    );

    setProfilePicture(
      user.profile_picture ?? ""
    );

    setHeightCm(
      user.height_cm != null
        ? String(user.height_cm)
        : ""
    );

    setGender(
      user.gender ?? "other"
    );

    setDateOfBirth(
      formatDateInput(
        user.date_of_birth
      )
    );

    setActivityLevel(
      user.activity_level ??
        "sedentary"
    );

    setGoal(
      user.goal ?? "maintain"
    );

    setDietPreference(
      user.diet_preference ??
        "none"
    );

    setMedicalConditions(
      user.medical_conditions ?? ""
    );

    setFoodAllergies(
      user.food_allergies ?? ""
    );

    setBio(
      user.bio ?? ""
    );
  }, [user]);

  /* ============================================================
     DERIVED
  ============================================================ */

  const firstLetter = useMemo(() => {
    return (
      fullName
        .trim()
        .charAt(0)
        .toUpperCase() || "?"
    );
  }, [fullName]);

  /* ============================================================
     EDIT
  ============================================================ */

  const startEditing = () => {
    if (!user) {
      return;
    }

    setFullName(
      user.full_name ?? ""
    );

    setProfilePicture(
      user.profile_picture ?? ""
    );

    setHeightCm(
  user.height_cm != null
    ? String(user.height_cm)
    : ""
);

    setGender(
      user.gender ?? "other"
    );

    setDateOfBirth(
      formatDateInput(
        user.date_of_birth
      )
    );

    setActivityLevel(
      user.activity_level ??
        "sedentary"
    );

    setGoal(
      user.goal ?? "maintain"
    );

    setDietPreference(
      user.diet_preference ??
        "none"
    );

    setMedicalConditions(
      user.medical_conditions ?? ""
    );

    setFoodAllergies(
      user.food_allergies ?? ""
    );

    setBio(
      user.bio ?? ""
    );

    setEditing(true);
  };

  const cancelEditing = () => {
    if (user) {
      setFullName(
        user.full_name ?? ""
      );

      setProfilePicture(
        user.profile_picture ?? ""
      );

      setHeightCm(
  user.height_cm != null
    ? String(user.height_cm)
    : ""
);

      setGender(
        user.gender ?? "other"
      );

      setDateOfBirth(
        formatDateInput(
          user.date_of_birth
        )
      );

      setActivityLevel(
        user.activity_level ??
          "sedentary"
      );

      setGoal(
        user.goal ?? "maintain"
      );

      setDietPreference(
        user.diet_preference ??
          "none"
      );

      setMedicalConditions(
        user.medical_conditions ?? ""
      );

      setFoodAllergies(
        user.food_allergies ?? ""
      );

      setBio(
        user.bio ?? ""
      );
    }

    setEditing(false);
  };

  /* ============================================================
     IMAGE UPLOAD
  ============================================================ */

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);
    setCropOpen(true);

    event.target.value = "";
  };

  const handleCropComplete = async (
    croppedFile: File
  ) => {
    try {
      setUploading(true);

      const imageUrl =
        await uploadImage(croppedFile);

      await profile({
        profile_picture: imageUrl,
      });

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

  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  const handleProfileUpdate =
    async () => {
      if (!fullName.trim()) {
        toast.error(
          "Please enter your name."
        );
        return;
      }

      if (
        heightCm &&
        Number.isNaN(
          Number(heightCm)
        )
      ) {
        toast.error(
          "Height must be a valid number."
        );
        return;
      }

      setLoadingProfile(true);

      try {
        /*
         * IMPORTANT:
         *
         * Your AuthContext.profile() must be
         * extended to accept these fields.
         *
         * See the note below this file.
         */
        await profile({
          full_name:
            fullName.trim(),

          profile_picture:
            profilePicture || null,

          height_cm:
          heightCm.trim()
            ? Number(heightCm)
            : null,

          gender,

          date_of_birth:
            dateOfBirth,

          activity_level:
            activityLevel,

          goal,

          diet_preference:
            dietPreference,

          medical_conditions:
            medicalConditions.trim(),

          food_allergies:
            foodAllergies.trim(),

          bio: bio.trim(),
        });

        setEditing(false);

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

  /* ============================================================
     PASSWORD
  ============================================================ */

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

  /* ============================================================
     DELETE ACCOUNT
  ============================================================ */

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

      if (!confirmed) {
        return;
      }

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

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1120,
        mx: "auto",
        pb: 5,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          justifyContent:
            "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 850,
              letterSpacing:
                "-0.035em",
            }}
          >
            Profile
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Your personal health
            identity and preferences.
          </Typography>
        </Box>

        {!editing ? (
          <Button
            variant="outlined"
            startIcon={
              <EditOutlinedIcon />
            }
            onClick={startEditing}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              fontWeight: 700,
              alignSelf: {
                xs: "stretch",
                sm: "auto",
              },
            }}
          >
            Edit profile
          </Button>
        ) : (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignSelf: {
                xs: "stretch",
                sm: "auto",
              },
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <CloseOutlinedIcon />
              }
              onClick={
                cancelEditing
              }
              disabled={
                loadingProfile
              }
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                flex: {
                  xs: 1,
                  sm: "initial",
                },
              }}
            >
              Cancel
            </Button>

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
              onClick={
                handleProfileUpdate
              }
              disabled={
                loadingProfile
              }
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                flex: {
                  xs: 1,
                  sm: "initial",
                },
              }}
            >
              {loadingProfile
                ? "Saving..."
                : "Save"}
            </Button>
          </Stack>
        )}
      </Stack>

      {/* ======================================================
          HERO
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: {
            xs: 2.5,
            sm: 3.5,
            md: 4,
          },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(33,150,243,0.15), rgba(33,150,243,0.035) 55%, transparent)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            right: -120,
            top: -150,
            bgcolor:
              "rgba(33,150,243,0.08)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={3}
          sx={{
            position: "relative",
            zIndex: 1,
            alignItems: {
              xs: "center",
              sm: "center",
            },
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
                  xs: 108,
                  sm: 124,
                },
                height: {
                  xs: 108,
                  sm: 124,
                },
                fontSize: "3rem",
                fontWeight: 800,
                bgcolor:
                  "primary.main",
                border: "5px solid",
                borderColor:
                  "background.paper",
                boxShadow:
                  "0 12px 40px rgba(33,150,243,0.25)",
              }}
            >
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  alt="Profile picture"
                  width={124}
                  height={124}
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
              disabled={uploading}
              sx={{
                position: "absolute",
                right: -4,
                bottom: -4,
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: "50%",
                boxShadow:
                  "0 5px 18px rgba(0,0,0,0.2)",
                "& .MuiButton-startIcon":
                  {
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
                <CameraAltOutlinedIcon fontSize="small" />
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

          {/* Identity */}

          <Box
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
                fontWeight: 850,
                letterSpacing:
                  "-0.035em",
                wordBreak:
                  "break-word",
              }}
            >
              {user?.full_name ||
                "Your Name"}
            </Typography>

            <Stack
              spacing={0.8}
              sx={{
                mt: 1.25,
              }}
            >
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
                  sx={{ fontSize: 18 }}
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
                  sx={{ fontSize: 17 }}
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
          </Box>
        </Stack>
      </Paper>

      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={
              <PersonOutlineRoundedIcon />
            }
            title="Personal information"
            description="Your basic identity and profile."
          />

          {editing ? (
            <Stack spacing={2.5}>
              <TextField
                label="Full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                fullWidth
              />

              <TextField
                label="Email"
                value={
                  user?.email ?? ""
                }
                disabled
                fullWidth
                helperText="Email is managed by your authentication provider."
              />

              <TextField
                label="Bio"
                value={bio}
                onChange={(event) =>
                  setBio(
                    event.target.value
                  )
                }
                multiline
                minRows={3}
                maxRows={6}
                fullWidth
                placeholder="Tell us a little about yourself..."
              />
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <InfoItem
                icon={
                  <PersonOutlineRoundedIcon fontSize="small" />
                }
                label="Full name"
                value={
                  user?.full_name ||
                  "—"
                }
              />

              <InfoItem
                icon={
                  <EmailOutlinedIcon fontSize="small" />
                }
                label="Email"
                value={
                  user?.email || "—"
                }
              />

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Bio
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.7,
                  }}
                >
                  {user?.bio ||
                    "No bio added yet."}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>

      {/* ======================================================
          BODY & DEMOGRAPHICS
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={
              <MonitorWeightOutlinedIcon />
            }
            title="Body & demographics"
            description="Information used to personalize your health guidance."
          />

          {editing ? (
            <Stack spacing={2.5}>
              <TextField
                label="Height"
                value={heightCm}
                onChange={(event) =>
                  setHeightCm(event.target.value)
                }
                fullWidth
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 50,
                    max: 300,
                  },
                  input: {
                    endAdornment: (
                      <Typography
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        cm
                      </Typography>
                    ),
                  },
                }}
              />

              <FormControl fullWidth>
                <InputLabel>
                  Gender
                </InputLabel>

                <Select
                  value={gender}
                  label="Gender"
                  onChange={(event) =>
                    setGender(
                      event.target
                        .value as Gender
                    )
                  }
                >
                  {(
                    Object.keys(
                      genderLabels
                    ) as Gender[]
                  ).map((value) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {
                        genderLabels[
                          value
                        ]
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date of birth"
                type="date"
                value={dateOfBirth}
                onChange={(event) =>
                  setDateOfBirth(
                    event.target
                      .value
                  )
                }
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              <InfoItem
                icon={
                  <HeightOutlinedIcon fontSize="small" />
                }
                label="Height"
                value={
                  user?.height_cm
                    ? `${user.height_cm} cm`
                    : "—"
                }
              />

              <InfoItem
                icon={
                  <PersonOutlineRoundedIcon fontSize="small" />
                }
                label="Gender"
                value={
                  user?.gender
                    ? genderLabels[
                        user.gender
                      ]
                    : "—"
                }
              />

              <InfoItem
                icon={
                  <CalendarTodayOutlinedIcon fontSize="small" />
                }
                label="Date of birth"
                value={formatDate(
                  user?.date_of_birth
                )}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* ======================================================
          HEALTH PREFERENCES
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={
              <FavoriteBorderRoundedIcon />
            }
            title="Health preferences"
            description="Your activity level, goal and dietary preference."
          />

          {editing ? (
            <Stack spacing={2.5}>
              <FormControl fullWidth>
                <InputLabel>
                  Activity level
                </InputLabel>

                <Select
                  value={
                    activityLevel
                  }
                  label="Activity level"
                  onChange={(event) =>
                    setActivityLevel(
                      event.target
                        .value as ActivityLevel
                    )
                  }
                >
                  {(
                    Object.keys(
                      activityLabels
                    ) as ActivityLevel[]
                  ).map((value) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {
                        activityLabels[
                          value
                        ]
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>
                  Goal
                </InputLabel>

                <Select
                  value={goal}
                  label="Goal"
                  onChange={(event) =>
                    setGoal(
                      event.target
                        .value as Goal
                    )
                  }
                >
                  {(
                    Object.keys(
                      goalLabels
                    ) as Goal[]
                  ).map((value) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {
                        goalLabels[
                          value
                        ]
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>
                  Diet preference
                </InputLabel>

                <Select
                  value={
                    dietPreference
                  }
                  label="Diet preference"
                  onChange={(event) =>
                    setDietPreference(
                      event.target
                        .value as DietPreference
                    )
                  }
                >
                  {(
                    Object.keys(
                      dietLabels
                    ) as DietPreference[]
                  ).map((value) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {
                        dietLabels[
                          value
                        ]
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              <InfoItem
                icon={
                  <LocalActivityOutlinedIcon fontSize="small" />
                }
                label="Activity level"
                value={
                  user?.activity_level
                    ? activityLabels[
                        user
                          .activity_level
                      ]
                    : "—"
                }
              />

              <InfoItem
                icon={
                  <FlagOutlinedIcon fontSize="small" />
                }
                label="Goal"
                value={
                  user?.goal
                    ? goalLabels[
                        user.goal
                      ]
                    : "—"
                }
              />

              <InfoItem
                icon={
                  <RestaurantOutlinedIcon fontSize="small" />
                }
                label="Diet"
                value={
                  user?.diet_preference
                    ? dietLabels[
                        user
                          .diet_preference
                      ]
                    : "—"
                }
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* ======================================================
          HEALTH INFORMATION
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={
              <MedicalServicesOutlinedIcon />
            }
            title="Health information"
            description="Information that can help personalize your AI health guidance."
          />

          {editing ? (
            <Stack spacing={2.5}>
              <TextField
                label="Medical conditions"
                value={
                  medicalConditions
                }
                onChange={(event) =>
                  setMedicalConditions(
                    event.target
                      .value
                  )
                }
                multiline
                minRows={3}
                fullWidth
                placeholder="Example: None"
              />

              <TextField
                label="Food allergies"
                value={
                  foodAllergies
                }
                onChange={(event) =>
                  setFoodAllergies(
                    event.target
                      .value
                  )
                }
                multiline
                minRows={3}
                fullWidth
                placeholder="Example: Peanuts, shellfish"
              />
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Medical conditions
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.7,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {user
                    ?.medical_conditions ||
                    "None provided"}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Food allergies
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.7,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {user?.food_allergies ||
                    "None provided"}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>

      {/* ======================================================
          ACCOUNT
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={
              <SecurityOutlinedIcon />
            }
            title="Account security"
            description="Manage your authentication and account access."
          />

          <Stack
            spacing={2.5}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor:
                  "action.hover",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Authentication
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                }}
              >
                {isLocalUser
                  ? "Email & password"
                  : "Google"}
              </Typography>
            </Box>

            {isLocalUser ? (
              <>
                <Divider />

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Change password
                </Typography>

                <TextField
                  label="Current password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) =>
                    setOldPassword(
                      event.target
                        .value
                    )
                  }
                  fullWidth
                />

                <TextField
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target
                        .value
                    )
                  }
                  fullWidth
                />

                <Button
                  variant="outlined"
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
                    alignSelf: {
                      xs: "stretch",
                      sm: "flex-end",
                    },
                    minWidth: 190,
                    borderRadius: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                  }}
                >
                  {loadingPassword
                    ? "Updating..."
                    : "Change password"}
                </Button>
              </>
            ) : (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor:
                    "rgba(33,150,243,0.06)",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                  }}
                >
                  You signed in with
                  Google. Password
                  management is handled
                  by your Google account.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* ======================================================
          DANGER ZONE
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor:
            "rgba(211,47,47,0.28)",
          bgcolor:
            "rgba(211,47,47,0.025)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 850,
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
            account permanently.
          </Typography>

          {isLocalUser && (
            <TextField
              label="Password"
              type="password"
              value={deletePassword}
              onChange={(event) =>
                setDeletePassword(
                  event.target.value
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
              disabled={
                loadingDelete
              }
              onClick={
                handleDeleteAccount
              }
              sx={{
                borderRadius: 2.5,
                py: 1.2,
                fontWeight: 700,
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
                py: 1.2,
                fontWeight: 700,
              }}
            >
              Sign out
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* ======================================================
          IMAGE CROPPER
      ====================================================== */}

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