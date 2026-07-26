import { useState } from "react";
import { getInitials } from "../../utils/user.js";

export default function UserAvatar({
  user,
  className = "",
  size,
  alt = "Profile",
  fallbackClassName = "avatar-initials",
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user?.avatar || user?.profileImage || user?.profileImageUrl || "";
  const style = size
    ? { width: size, height: size, borderRadius: "50%", overflow: "hidden" }
    : undefined;

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={{
          ...(style || {}),
          objectFit: "cover",
          display: "block",
        }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <span className={fallbackClassName}>{getInitials(user?.name)}</span>;
}
