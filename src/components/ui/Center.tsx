import type { ReactNode, CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Center({ children, className, style, ...props }: CenterProps) {
  return (
    <div className={cn("mx-auto w-[1020px]", className)} style={style} {...props}>
      {children}
    </div>
  );
}
