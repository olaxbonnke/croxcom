import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { mockUsers, type MockUser } from "@/data/mock";
import { X, Check, Upload, Image as ImageIcon, Camera, User } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/lib/AuthContext";

interface ProfileHeaderProps {
  user: MockUser;
  isCurrentUser?: boolean;
  onUpdateUser?: (updated: MockUser) => void;
}

const AVATAR_COLORS = [
  "#00ff9f", // CroxCom Neon Teal
  "#7dd3fc", // Cyan
  "#f9a8a8", // Coral Pink
  "#c9a0dc", // Purple
  "#fbbf24", // Gold
  "#a8c0a0", // Sage Green
  "#f43f5e", // Rose
];

export function ProfileHeader({ user: initialUser, isCurrentUser, onUpdateUser }: ProfileHeaderProps) {
  const { updateUser } = useAuth();
  const { posts } = usePosts();
  
  const [user, setUser] = useState<MockUser>(initialUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // User list modal state (Followers vs Following)
  const [userListMode, setUserListMode] = useState<"followers" | "following" | null>(null);

  // Edit form state
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [role, setRole] = useState(user.role || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || "#00ff9f");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [banner, setBanner] = useState(user.banner || "");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Calculate real post count for this user
  const userPostsCount = posts.filter(
    (p) => p.author.id === user.id || p.author.handle === user.handle
  ).length;

  useEffect(() => {
    setUser(initialUser);
    setName(initialUser.name);
    setHandle(initialUser.handle);
    setRole(initialUser.role || "");
    setBio(initialUser.bio || "");
    setAvatarColor(initialUser.avatarColor || "#00ff9f");
    setAvatar(initialUser.avatar || "");
    setBanner(initialUser.banner || "");
  }, [initialUser]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBanner(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updated: MockUser = {
      ...user,
      name: name.trim() || user.name,
      handle: handle.trim() || user.handle,
      role: role.trim(),
      bio: bio.trim(),
      avatarColor,
      avatar: avatar.trim() || undefined,
      banner: banner.trim() || undefined,
    };

    setUser(updated);
    if (isCurrentUser) {
      updateUser(updated);
    }
    onUpdateUser?.(updated);
    setShowEditModal(false);
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Related users for followers/following list
  const sampleUsersList = mockUsers.filter((u) => u.handle !== user.handle);

  return (
    <div className="w-full">
      {/* Cover area */}
      <div
        className="h-36 bg-gradient-to-r from-card via-accent/20 to-card bg-cover bg-center relative"
        style={user.banner ? { backgroundImage: `url(${user.banner})` } : undefined}
      >
        {isCurrentUser && (
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2.5 py-1 font-mono text-xs text-white backdrop-blur-sm hover:bg-black/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>change banner</span>
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-8 relative z-10">
          {/* Avatar */}
          <div
            className="h-20 w-20 rounded-xl ring-4 ring-background flex items-center justify-center text-background font-mono text-2xl font-bold transition-all shadow-lg overflow-hidden relative group"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
            {isCurrentUser && (
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono cursor-pointer"
              >
                <Camera className="h-4 w-4 mb-0.5" />
                <span>upload</span>
              </button>
            )}
          </div>

          {/* Action button */}
          <div>
            {isCurrentUser ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="font-mono text-sm rounded-md px-4 py-1.5 border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer text-foreground bg-background shadow-sm"
              >
                edit profile
              </button>
            ) : (
              <button
                onClick={() => setIsFollowing((prev) => !prev)}
                className={`font-mono text-sm rounded-md px-4 py-1.5 transition-all cursor-pointer shadow-sm ${
                  isFollowing
                    ? "border border-border bg-background text-foreground hover:border-destructive hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                }`}
              >
                {isFollowing ? "following" : "follow"}
              </button>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="mt-3">
          <h1 className="text-xl font-bold text-foreground tracking-tight">{user.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">@{user.handle}</p>
        </div>

        {user.role && (
          <div className="font-mono text-xs text-primary border border-primary/30 bg-primary/10 rounded-md px-2.5 py-0.5 mt-1.5 inline-block font-semibold">
            {user.role}
          </div>
        )}

        {user.bio && (
          <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-xl">
            {user.bio}
          </p>
        )}

        {/* Real Stats & Clickable Followers/Following */}
        <div className="mt-4 flex gap-6 font-mono text-xs text-muted-foreground border-t border-border/40 pt-3">
          <div className="flex items-center gap-1">
            <span className="text-foreground font-bold text-sm">
              {userPostsCount}
            </span>{" "}
            <span>posts</span>
          </div>

          <button
            onClick={() => setUserListMode("followers")}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="text-foreground font-bold text-sm group-hover:text-primary">
              {((user.followers ?? 0) + (isFollowing ? 1 : 0)).toLocaleString()}
            </span>{" "}
            <span className="underline decoration-dotted underline-offset-4">followers</span>
          </button>

          <button
            onClick={() => setUserListMode("following")}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
          >
            <span className="text-foreground font-bold text-sm group-hover:text-primary">
              {(user.following ?? 0).toLocaleString()}
            </span>{" "}
            <span className="underline decoration-dotted underline-offset-4">following</span>
          </button>
        </div>
      </div>

      {/* ── FOLLOWERS / FOLLOWING LIST MODAL ── */}
      {userListMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
              <span className="font-mono text-xs text-primary font-bold capitalize">
                $ {user.handle} --{userListMode}
              </span>
              <button
                onClick={() => setUserListMode(null)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto divide-y divide-border/40 scrollbar-none">
              {sampleUsersList.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2.5 px-2 hover:bg-accent/30 rounded-lg transition-colors">
                  <Link
                    to="/profile/$handle"
                    params={{ handle: u.handle }}
                    onClick={() => setUserListMode(null)}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <div
                      className="h-9 w-9 rounded-md font-mono text-xs font-bold grid place-items-center shrink-0"
                      style={{ backgroundColor: u.avatarColor, color: "#0a0a0a" }}
                    >
                      {u.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{u.name}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">@{u.handle}</div>
                    </div>
                  </Link>

                  <button className="font-mono text-xs rounded border border-border px-2.5 py-1 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    view
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
              <span className="font-mono text-xs text-primary font-semibold">
                $ profile --edit
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-none">
              {/* Profile Avatar Upload */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5">
                  Profile Picture (Avatar)
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-14 w-14 rounded-lg overflow-hidden grid place-items-center font-mono font-bold border border-border"
                    style={{ backgroundColor: avatarColor, color: "#0a0a0a" }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="font-mono text-xs text-destructive hover:underline cursor-pointer"
                    >
                      remove
                    </button>
                  )}
                </div>
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5">
                  Header Banner Picture
                </label>
                <div className="space-y-2">
                  {banner && (
                    <div className="h-16 w-full rounded-md border border-border overflow-hidden bg-cover bg-center">
                      <img src={banner} alt="Banner Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerFileChange}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground hover:border-primary transition-colors cursor-pointer"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Upload Banner</span>
                    </button>
                    {banner && (
                      <button
                        type="button"
                        onClick={() => setBanner("")}
                        className="font-mono text-xs text-destructive hover:underline cursor-pointer"
                      >
                        remove banner
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  Handle (@)
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. ML Researcher @ Lab"
                  className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none scrollbar-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-md border border-border py-2 font-mono text-xs text-muted-foreground hover:bg-accent cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-md bg-primary py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
