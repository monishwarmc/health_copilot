import { Area } from "react-easy-crop";

const createImage = (
  url: string
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () =>
      resolve(image)
    );

    image.addEventListener("error", reject);

    image.crossOrigin = "anonymous";

    image.src = url;
  });

export default async function getCroppedImg(
  file: File,
  crop: Area
): Promise<File> {
  const image = await createImage(
    URL.createObjectURL(file)
  );

  const canvas =
    document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Failed to create canvas."
    );
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Image cropping failed."
            )
          );
          return;
        }

        resolve(
          new File(
            [blob],
            file.name,
            {
              type: "image/jpeg",
            }
          )
        );
      },
      "image/jpeg",
      0.95
    );
  });
}