import heic2any from "heic2any";

export const isHeicFile = (file) => {
  if (!file) return false;
  const name = file.name?.toLowerCase() || "";
  const type = file.type?.toLowerCase() || "";
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif"
  );
};

export const convertHeicToJpeg = async (file) => {
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const safeName = file.name?.replace(/\.(heic|heif)$/i, "") || "photo";
  return new File([blob], `${safeName}.jpg`, { type: "image/jpeg" });
};
