import { useLocation } from "react-router-dom";
import moment from "moment";
import { Center } from "@/components/ui/Center";
import { cn } from "@/lib/cn";

function getEventTagColor(color: string) {
  if (color === "온&오프라인") return "bg-[#d87299]";
  if (color === "오프라인몰") return "bg-[#9f87c9]";
  return "bg-[#9bce26]";
}

const StoreEventDetail = () => {
  const information = useLocation().state;

  return (
    <Center>
      <div role="article" aria-label="이벤트 상세">
        <div className="flex items-center justify-between py-[15px] [&_em]:text-[#333] [&_h2]:font-[350]">
          <div className="flex items-stretch gap-[15px]">
            {(information?.off_line || information?.on_line) && (
              <span
                className={cn(
                  "inline-block h-7 min-w-[100px] rounded-[20px] text-center text-[13px] font-bold leading-7 text-white",
                  getEventTagColor(
                    information?.off_line && information?.on_line
                      ? "온&오프라인"
                      : information?.off_line
                      ? "오프라인몰"
                      : "온라인몰"
                  )
                )}
              >
                {information?.off_line && information?.on_line
                  ? "온&오프라인"
                  : information?.off_line
                  ? "오프라인몰"
                  : "온라인몰"}
              </span>
            )}
            <h2>{information?.detail_text}</h2>
          </div>
          <em>
            {moment(information?.start_date).format("YYYY-MM-DD")} ~{" "}
            {moment(information?.end_date).format("YYYY-MM-DD")}
          </em>
        </div>
        <img
          className="mx-auto my-10 block w-[750px]"
          src={information?.detail_img}
          alt="detail_img"
        />
      </div>
    </Center>
  );
};

export default StoreEventDetail;
