import {
  getAttachmentName,
  isImagePostAttachment,
} from "../Utils/AttachmentUtils";

describe("attachment utilities", () => {
  it("recognizes an image from its MIME type even when the signed URL has no extension", () => {
    expect(
      isImagePostAttachment({
        fileUrl: "https://example.com/uploads/opaque-key?signature=123",
        fileName: "class-photo",
        fileType: "image/jpeg",
      })
    ).toBe(true);
  });

  it("does not render a regular document as an image", () => {
    expect(
      isImagePostAttachment({
        fileUrl: "https://example.com/uploads/lesson-plan.pdf?signature=123",
        fileName: "lesson-plan.pdf",
        fileType: "application/pdf",
      })
    ).toBe(false);
  });

  it("uses the saved display name for the attachment label", () => {
    expect(getAttachmentName({ fileName: "weekly-materials.pdf" })).toBe(
      "weekly-materials.pdf"
    );
  });
});
