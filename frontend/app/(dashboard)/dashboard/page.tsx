"use client";

import ProfileImageCropper
from "@/components/profile/ProfileImageCropper";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  Button,
  Stack,
  Typography,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import Image from "next/image";

import AuthCard from "@/components/ui/AuthCard";
import { useAuth } from "@/context/AuthContext";
import getErrorMessage from "@/lib/error";
import { uploadImage } from "@/services/cloudinary.service";

export default function dashboard() {
  const {
    user,
    logout,
    profile,
    password,
    account,
    googleVerify,
  } = useAuth();

  const isLocalUser = user?.auth_provider === "local";

  const [fullName, setFullName] = useState(
    user?.full_name ?? ""
  );

  const [profilePicture, setProfilePicture] = useState(
    user?.profile_picture ?? ""
  );


  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [cropOpen, setCropOpen] =
    useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);

    setCropOpen(true);
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
    } catch (e) {
      toast.error(
        getErrorMessage(e)
      );
    } finally {
      setUploading(false);
      setCropOpen(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <AuthCard
      title={user?.full_name ?? ""}
      subtitle={user?.email ?? ""}
      maxwidth="md"
    >
      <Stack spacing={3}>
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          {user?.profile_picture && (
            <Image
              src={user.profile_picture}
              alt="Profile"
              width={96}
              height={96}
              style={{
                borderRadius: "50%",
              }}
            />
          )}

          <Typography variant="body2">
            User ID: {user?.id}
          </Typography>

          <Typography variant="body2">
            Created: {formatDate(user?.created_at)}
          </Typography>
        </Stack>

        <Divider />
        <Typography variant="h6">
          Update Profile
        </Typography>

        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
        />

        <Stack spacing={2}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={uploading}
          >
            {uploading ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems:"center"
                }}
              >
                <CircularProgress
                  size={20}
                  color="inherit"
                />
                <Typography>
                  Uploading...
                </Typography>
              </Stack>
            ) : (
              "Upload Profile Picture"
            )}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
        </Stack>

        <Button
          variant="contained"
          startIcon={
            loadingProfile ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <SaveIcon />
            )
          }
          disabled={loadingProfile || uploading}
          onClick={async () => {
            setLoadingProfile(true);

            try {
              await profile(
                fullName || null,
                profilePicture || null
              );

              toast.success("Profile updated successfully");
            } catch (e) {
              toast.error(getErrorMessage(e));
            } finally {
              setLoadingProfile(false);
            }
          }}
        >
          {loadingProfile ? "Updating..." : "Update Profile"}
        </Button>

        {/* Change Password Section (Local Users Only) */}
        {isLocalUser && (
          <>
            <Divider />
            <Typography variant="h6">
              Change Password
            </Typography>

            <TextField
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
            />

            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              color="warning"
              startIcon={
                loadingPassword ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <LockResetIcon />
                )
              }
              disabled={loadingPassword}
              onClick={async () => {
                if (!oldPassword || !newPassword) {
                  toast.error("Please enter both passwords.");
                  return;
                }

                setLoadingPassword(true);

                try {
                  const message = await password(
                    oldPassword,
                    newPassword
                  );

                  toast.success(message);

                  setOldPassword("");
                  setNewPassword("");
                } catch (e) {
                  toast.error(getErrorMessage(e));
                } finally {
                  setLoadingPassword(false);
                }
              }}
            >
              {loadingPassword
                ? "Updating Password..."
                : "Change Password"}
            </Button>
          </>
        )}

        <Divider />
        <Typography variant="h6" color="error">
          Delete Account
        </Typography>

        <Typography variant="body2">
          This action is permanent and cannot be undone.
        </Typography>

        {isLocalUser && (
          <TextField
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
          />
        )}

        <Button
          variant="contained"
          color="error"
          startIcon={
            loadingDelete ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <DeleteForeverIcon />
            )
          }
          disabled={loadingDelete}
          onClick={async () => {
            // Validation check for local users before trigger
            if (isLocalUser && !deletePassword) {
              toast.error("Please enter your password to confirm deletion.");
              return;
            }

            if (
              !confirm(
                "Are you sure you want to permanently delete your account?"
              )
            ) {
              return;
            }

            setLoadingDelete(true);

            try {
              let message = "";

              if (isLocalUser) {
                message = await account(deletePassword, null);
              } else {
                // Execute googleVerify as a function to retrieve the ID token string
                const idToken = await googleVerify();
                message = await account(null, idToken);
              }

              toast.success(message);
              logout();
            } catch (e) {
              toast.error(getErrorMessage(e));
            } finally {
              setLoadingDelete(false);
            }
          }}
        >
          {loadingDelete ? "Deleting..." : "Delete Account"}
        </Button>

        <Divider />

        <Button
          variant="contained"
          color="warning"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={logout}
        >
          Logout
        </Button>
      </Stack>
      <ProfileImageCropper
    open={cropOpen}
    image={selectedImage}
    onCancel={() => setCropOpen(false)}
    onSave={handleCropComplete}
/>
    </AuthCard>
  );
}