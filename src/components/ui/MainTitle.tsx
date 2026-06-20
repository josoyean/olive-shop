import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MainTitleProps {
  children: ReactNode;
  className?: string;
}

export function MainTitle({ children, className }: MainTitleProps) {
  return (
    <div className={cn("relative z-[2]", className)}>
      <div>
        <div className="flex items-baseline gap-[17px] pt-[30px] [&_em]:text-[17px] [&_em]:font-light [&_span]:text-[40px] [&_span]:font-bold">
          {children}
        </div>
      </div>
    </div>
  );
}
