import Post from "../Model/Posts/Post";

describe("Post class", () => {
  const createPost = (overrides = {}) =>
    new Post(
      overrides.id ?? 1,
      overrides.user ?? "user",
      overrides.title ?? "Post title",
      overrides.postContent ?? "This is a post.",
      overrides.likes ?? 0,
      overrides.comments ?? [],
      overrides.fileUrl ?? null,
      overrides.communityName ?? "General",
      overrides.commentsCount ?? 0
    );

  it("should have an id", () => {
    const post = createPost();

    expect(post.id).toBe(1);
  });

  it("should have a title", () => {
    const post = createPost();

    expect(post.title).toBe("Post title");
  });

  it("should have a postContent", () => {
    const post = createPost();

    expect(post.postContent).toBe("This is a post.");
  });

  it("should have a likes count of 0 by default", () => {
    const post = createPost();

    expect(post.likes).toBe(0);
  });

  it("should have a user", () => {
    const post = createPost();

    expect(post.user).toBe("user");
  });

  it("should have an empty comments list by default", () => {
    const post = createPost();

    expect(post.comments).toEqual([]);
  });

  it("should have a fileUrl, optionally", () => {
    const post = createPost();

    expect(post.fileUrl).toBeNull();

    const postWithFileUrl = createPost({
      fileUrl: "https://example.com/file.pdf",
    });

    expect(postWithFileUrl.fileUrl).toBe("https://example.com/file.pdf");
  });

  it("should have a communityName", () => {
    const post = createPost();

    expect(post.communityName).toBe("General");
  });

  it("should have a commentsCount", () => {
    const post = createPost();

    expect(post.commentsCount).toBe(0);
  });
});
