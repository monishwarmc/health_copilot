"use client";

import { useState, useCallback } from "react";

import Cropper, {
  Area,
} from "react-easy-crop";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Stack,
} from "@mui/material";

import getCroppedImg from "./cropImage";

interface Props {
  open: boolean;
  image: File | null;

  onCancel: () => void;

  onSave: (
    file: File
  ) => void;
}

export default function ProfileImageCropper({
  open,
  image,
  onCancel,
  onSave,
}: Props) {

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels,
    setCroppedAreaPixels
  ] = useState<Area>();

  const onCropComplete = useCallback(
    (
      _: Area,
      croppedAreaPixels: Area
    ) => {
      setCroppedAreaPixels(
        croppedAreaPixels
      );
    },
    []
  );

  const handleSave = async () => {

    if (
      !image ||
      !croppedAreaPixels
    ) return;

    const croppedFile =
      await getCroppedImg(
        image,
        croppedAreaPixels
      );

    onSave(croppedFile);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Crop Profile Picture
      </DialogTitle>

      <DialogContent>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 400,
            background: "#111",
          }}
        >
          {image && (
            <Cropper
              image={URL.createObjectURL(
                image
              )}

              crop={crop}
              zoom={zoom}

              aspect={1}

              cropShape="round"

              showGrid={false}

              onCropChange={setCrop}

              onZoomChange={setZoom}

              onCropComplete={
                onCropComplete
              }
            />
          )}
        </div>

        <Stack
          sx={{
            mt: 3,
            px: 1,
          }}
        >
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(_, value) =>
              setZoom(value as number)
            }
          />
        </Stack>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>

      </DialogActions>

    </Dialog>
  );
}