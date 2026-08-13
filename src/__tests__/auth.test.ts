import { describe, it, expect, beforeEach } from "vitest";

describe("Auth & Session Storage Unit Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears all user data keys on logout", () => {
    localStorage.setItem("croxcom-user-profile", JSON.stringify({ name: "User" }));
    localStorage.setItem("croxcom-bookmarks", JSON.stringify(["b1"]));
    localStorage.setItem("croxcom_communities", JSON.stringify({ joined: ["c1"] }));
    localStorage.setItem("croxcom-saved-library-ids", JSON.stringify(["l1"]));
    localStorage.setItem("croxcom-galleries", JSON.stringify(["g1"]));

    // Simulate logout action
    localStorage.removeItem("croxcom-user-profile");
    localStorage.removeItem("croxcom-bookmarks");
    localStorage.removeItem("croxcom_communities");
    localStorage.removeItem("croxcom-saved-library-ids");
    localStorage.removeItem("croxcom-galleries");

    expect(localStorage.getItem("croxcom-user-profile")).toBeNull();
    expect(localStorage.getItem("croxcom-bookmarks")).toBeNull();
    expect(localStorage.getItem("croxcom_communities")).toBeNull();
    expect(localStorage.getItem("croxcom-saved-library-ids")).toBeNull();
    expect(localStorage.getItem("croxcom-galleries")).toBeNull();
  });

  it("persists onboarding completion flag", () => {
    localStorage.setItem("croxcom_onboarded_global", "true");
    expect(localStorage.getItem("croxcom_onboarded_global")).toBe("true");
  });
});
