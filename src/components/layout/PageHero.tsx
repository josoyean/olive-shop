import type { ReactNode } from "react";
import { Center } from "@/components/ui/Center";
import { MainTitle } from "@/components/ui/MainTitle";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export function PageHero({ title, subtitle, className }: PageHeroProps) {
  return (
    <MainTitle
      className={cn(
        "h-[150px] bg-[url('/public/assets/images/icons/bg_sp_visual.png')] bg-[position:50%_0] bg-no-repeat",
        "[&_em]:text-white [&_span]:text-white",
        className
      )}
    >
      <Center>
        <div>
          <span>{title}</span>
          {subtitle && <em>{subtitle}</em>}
        </div>
      </Center>
    </MainTitle>
  );
}
