import { useState, useRef } from "react";
import "./UserAvatar.css";

/**
 * UserAvatar — reusable avatar component
 *
 * Props:
 *  user         — { name, avatar }
 *  size         — "xs" | "sm" | "md" | "lg" | "xl"
 *  editable     — show camera icon on hover (upload mode)
 *  onFileSelect — callback(file) jab user image select kare
 *  uploading    — boolean, spinner dikhata hai
 */
const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

const UserAvatar = ({
  user,
  size = "md",
  editable = false,
  onFileSelect,
  uploading = false,
}) => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const fontSize = Math.max(10, Math.floor(px * 0.38));

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image 5MB se chhoti honi chahiye");
      return;
    }
    setPreview(URL.createObjectURL(file));
    if (onFileSelect) onFileSelect(file);
  };

  const imgSrc = preview || user?.avatar;

  return (
    <div
      className={`user-avatar user-avatar--${size} ${editable ? "user-avatar--editable" : ""}`}
      style={{ width: px, height: px, fontSize }}
      onClick={() => editable && inputRef.current?.click()}
    >
      {/* Avatar image or initials */}
      {imgSrc ? (
        <img src={imgSrc} alt={user?.name || "avatar"} className="user-avatar__img" />
      ) : (
        <div className="user-avatar__initials">
          {getInitials(user?.name)}
        </div>
      )}

      {/* Upload spinner */}
      {uploading && (
        <div className="user-avatar__uploading">
          <div className="user-avatar__spinner" />
        </div>
      )}

      {/* Camera overlay — only in editable mode */}
      {editable && !uploading && (
        <div className="user-avatar__overlay">
          <span className="user-avatar__camera">📷</span>
        </div>
      )}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};

export default UserAvatar;