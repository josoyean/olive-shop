import { useEffect, useCallback, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import type { EventType } from "../../components/card/card.type";
import moment from "moment";
import EmptyComponent from "../../components/EmptyComponent";
import { PageHero } from "@/components/layout/PageHero";
import { Center } from "@/components/ui/Center";
import { Tabs, TabItem } from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";

function getEventTagColor(color: string) {
  if (color === "온&오프라인") return "bg-[#d87299]";
  if (color === "오프라인몰") return "bg-[#9f87c9]";
  return "bg-[#9bce26]";
}

function EventTag({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "absolute left-2.5 top-2.5 min-w-[100px] rounded-[20px] text-center text-sm font-medium leading-7 text-white",
        getEventTagColor(color)
      )}
    >
      {children}
    </span>
  );
}

const StoreEvents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabsType = searchParams.get("tabsType");
  const [objects, setObjects] = useState<EventType[]>([]);

  const handleLoadData = useCallback(async () => {
    let query = supabase
      .from("events")
      .select("*")
      .lte("start_date", moment().format("YYYY-MM-DD"))
      .gte("end_date", moment().format("YYYY-MM-DD"));
    if (tabsType === "구매회원") {
      query = query.eq("buy_member", "True");
    }
    const { data } = await query;
    setObjects(data ?? []);
  }, [tabsType]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);
  return (
    <section role="region" aria-label="이벤트">
      <PageHero
        title="이벤트"
        subtitle="풍성한 이벤트! 즐거운 올리브영"
        className="h-[100px] bg-[url('/public/assets/images/icons/bg_event_top1.png')] bg-[position:50%_0] bg-no-repeat [&_em]:text-black [&_span]:text-black"
      />
      <Center>
        <div>
          <Tabs grid={3} role="tablist" aria-label="이벤트 필터">
            <TabItem
              active={tabsType === "모든회원"}
              onClick={() => {
                setSearchParams({ tabsType: "모든회원" });
              }}
            >
              모든회원
            </TabItem>
            <TabItem
              active={tabsType === "구매회원"}
              onClick={() => {
                setSearchParams({ tabsType: "구매회원" });
              }}
            >
              구매회원
            </TabItem>
            <TabItem
              active={tabsType === "체험단"}
              onClick={() => {
                alert("준비중 입니다");
              }}
            >
              체험단
            </TabItem>
          </Tabs>
          <div
            className={cn(
              "mb-[50px] justify-between gap-y-[50px] [grid-template-columns:repeat(3,330px)]",
              objects.length === 0 ? "block" : "grid grid-cols-3"
            )}
          >
            {objects.length === 0 ? (
              <EmptyComponent
                mainText="선택 결과가 없어요"
                subText="이벤트 타입을 다시 선택해주세요"
              />
            ) : (
              objects.map((item, index) => (
                <div
                  className="objects relative w-[330px] cursor-pointer"
                  key={index}
                  onClick={(event) => {
                    event.preventDefault();
                    const between = moment(new Date()).isBetween(
                      item.start_date,
                      item.end_date
                    );
                    if (!between) {
                      alert("이밴트 기간이 아닙니다");
                      handleLoadData();
                      return;
                    }
                    navigate("/store/event-detail", { state: { ...item } });
                  }}
                >
                  <img
                    className="event-img block h-[176px] w-[330px]"
                    src={item.img}
                    alt="event-img"
                  />
                  {(item.off_line || item.on_line) && (
                    <EventTag
                      color={
                        item.off_line && item.on_line
                          ? "온&오프라인"
                          : item.off_line
                          ? "오프라인몰"
                          : "온라인몰"
                      }
                    >
                      {item.off_line && item.on_line
                        ? "온&오프라인"
                        : item.off_line
                        ? "오프라인몰"
                        : "온라인몰"}
                    </EventTag>
                  )}
                  <div className="text-wrap text-center">
                    <strong className="my-4 mb-px inline-block h-[30px] overflow-hidden text-[21px] leading-[30px] text-[#333]">
                      {item.main_title}
                    </strong>
                    <p className="sub-title h-5 overflow-hidden leading-5 tracking-[-0.02em] text-[#777] [word-break:break-all]">
                      {item.sub_title}
                    </p>
                    <p className="date mt-[11px] text-center text-sm font-bold text-[#888]">
                      {moment(item.start_date).format("YYYY-MM-DD")} ~{" "}
                      {moment(item.end_date).format("YYYY-MM-DD")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Center>
    </section>
  );
};

export default StoreEvents;
