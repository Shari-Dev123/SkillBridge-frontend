import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import "./Badge.css";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: <Clock size={12} />,
  },
  in_progress: {
    label: "In Progress",
    icon: <Loader2 size={12} />,
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={12} />,
  },
};

const Badge = ({ status }) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return <span className="badge badge--unknown">{status}</span>;
  }

  return (
    <span className={`badge badge--${status}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default Badge;