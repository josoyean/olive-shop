import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocation } from "react-router-dom";

const TopButton = () => {
  const [block, setBlock] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setBlock(window.scrollY > 180);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, location.pathname]);

  return (
    <div
      role="button"
      aria-label="Scroll to Top"
      onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed right-4 bottom-[75px] z-[1200] h-[55px] w-[55px] cursor-pointer rounded-full border border-line-main bg-primary text-center text-sm leading-[55px] text-white transition-[opacity,visibility] duration-500",
        block ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
      )}
    >
      TOP
    </div>
  );
};

export default TopButton;
