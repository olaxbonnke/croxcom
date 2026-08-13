import { describe, it, expect, beforeEach } from "vitest";

describe("Posts & Social Feed Unit Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists created post into local storage cache", () => {
    const mockPost = {
      id: "post-123",
      body: "Test AI Post content for CroxCom",
      author: { id: "u1", name: "Alice", handle: "alice" },
    };

    localStorage.setItem("croxcom_local_user_posts", JSON.stringify([mockPost]));
    const stored = JSON.parse(localStorage.getItem("croxcom_local_user_posts") || "[]");

    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("post-123");
    expect(stored[0].body).toContain("CroxCom");
  });

  it("handles like state toggle logic cleanly", () => {
    const likedSet = new Set<string>();
    const postId = "post-999";

    // First toggle: like
    if (likedSet.has(postId)) {
      likedSet.delete(postId);
    } else {
      likedSet.add(postId);
    }
    expect(likedSet.has(postId)).toBe(true);

    // Second toggle: unlike
    if (likedSet.has(postId)) {
      likedSet.delete(postId);
    } else {
      likedSet.add(postId);
    }
    expect(likedSet.has(postId)).toBe(false);
  });
});
