import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocation } from "react-router-dom";

const TopButton = () => {
  const [block, setBlock] = useState<boolean>(false);
  const location = useLocation();
  const handleScroll = useCallback(() => {
    if (window.pageYOffset > 180) {
      setBlock(true);
    } else {
      setBlock(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      role="button"
      aria-label="Scroll to Top"
      onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed bottom-[75px] right-[calc((100vw-1020px)/2-210px)] h-[55px] w-[55px] cursor-pointer rounded-full border border-line-main bg-primary text-center text-sm leading-[55px] text-white transition-[opacity,visibility] duration-500",
        block ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      TOP
    </div>
  );
};

export default TopButton;
