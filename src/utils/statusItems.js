const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);
const VIDEO_EXTENSIONS = new Set(["mp4"]);

function getFilenameFromUri(uri) {
  try {
    const decoded = decodeURIComponent(uri);
    const lastSegment = decoded.split("/").pop() || decoded;
    const afterDocumentId = lastSegment.includes(":")
      ? lastSegment.split(":").pop()
      : lastSegment;
    return afterDocumentId.split("/").pop() || afterDocumentId;
  } catch {
    return uri.split("/").pop() || uri;
  }
}

function getExtension(filename) {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return filename.slice(dotIndex + 1).toLowerCase();
}

function getType(extension) {
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return null;
}

export function parseStatusItem(uri) {
  const filename = getFilenameFromUri(uri);
  const extension = getExtension(filename);
  const type = getType(extension);

  if (!type) return null;

  return {
    id: uri,
    uri,
    type,
    filename,
    extension,
  };
}

export function parseStatusItems(uris) {
  return uris.map(parseStatusItem).filter(Boolean);
}
