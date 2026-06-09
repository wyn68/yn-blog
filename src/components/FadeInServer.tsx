import { memo } from "react";
import { motionTokens } from "@/lib/motion-tokens";

interface FadeInServerProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

export const FadeInServer = memo(function FadeInServer({
  children,
  delay = 0,
  duration,
  className = "",
}: FadeInServerProps) {
  const resolvedDuration = duration ?? motionTokens.duration.normal;
  
  return (
    <div
      className={className}
      style={{
        opacity: 0,
        animation: `slideUp ${resolvedDuration}s ease-out ${delay}s forwards`,
      }}
    >
      {children}
    </div>
  );
});

export default FadeInServer;
