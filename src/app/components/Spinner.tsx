import { LoaderIcon } from "lucide-react";
import React from "react";

interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: number;
}

function Spinner({ size = 16, className = "", style, ...props }: SpinnerProps) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      size={size}
      className={`animate-spin ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}

export { Spinner };
