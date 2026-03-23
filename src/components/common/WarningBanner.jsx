import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import "./WarningBanner.css";

/**
 * WarningBanner — user ke dashboard par show hota hai
 * agar admin ne warning di ho.
 *
 * Usage:
 *   <WarningBanner warning={user.warning} />
 */
const WarningBanner = ({ warning }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!warning || dismissed) return null;

  return (
    <div className="wb-banner">
      <ShieldAlert size={20} className="wb-icon" />
      <div className="wb-content">
        <p className="wb-title">Admin Warning</p>
        <p className="wb-message">{warning}</p>
      </div>
      <button className="wb-close" onClick={() => setDismissed(true)} title="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
};

export default WarningBanner;