const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|heic|heif|avif)(?:$|\?)/i;

const getAttachmentName = (post) => {
  if (typeof post?.fileName === "string" && post.fileName.trim()) {
    return post.fileName.trim();
  }

  try {
    const pathname = new URL(post?.fileUrl).pathname;
    return decodeURIComponent(pathname.split("/").filter(Boolean).pop()) || "Attachment";
  } catch (error) {
    return "Attachment";
  }
};

const isImagePostAttachment = (post) => {
  const normalizedType = typeof post?.fileType === "string"
    ? post.fileType.trim().toLowerCase()
    : "";

  if (normalizedType === "image" || normalizedType.startsWith("image/")) {
    return true;
  }

  return IMAGE_EXTENSIONS.test(getAttachmentName(post)) ||
    IMAGE_EXTENSIONS.test(post?.fileUrl || "");
};

export { getAttachmentName, isImagePostAttachment };
