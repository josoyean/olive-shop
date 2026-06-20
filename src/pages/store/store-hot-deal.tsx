import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import HotDealCard from "../../components/card/HotDealCard";
import type { CardImageType } from "components/card/card.type";
import moment from "moment";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { PageHero } from "@/components/layout/PageHero";

const StoreHotDeal = () => {
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const todays = moment().format("YYYY-MM-DD");
  const today = new Date().toISOString().split("T")[0];
  const handleData = async () => {
    const { data, error } = await supabase
      .from("objects")
      .select("*, saleItem(*)")
      .not("saleItem", "is", null)
      .filter("saleItem.start_today_sale_date", "lte", today)
      .filter("saleItem.end_today_sale_date", "gte", today);

    if (!data) return;
    setObjects(data ?? []);
    if (error) {
      console.error("Supabase Error:", error);
    }
  };
  const padZero = (num: number) => String(num).padStart(2, "0");
  useEffect(() => {
    handleData();
  }, []);
  const renderer = ({ hours, minutes, seconds }: CountdownRenderProps) => {
    return (
      <span>
        오늘의 특가 {padZero(hours)}:{padZero(minutes)}:{padZero(seconds)}
      </span>
    );
  };
  return (
    <section role="region" aria-label="오늘의 특가">
      <PageHero
        title="오늘의 특가"
        subtitle="딱 하루만! 오늘의 특가 찬스"
      />
      <div className="relative z-[99] mx-auto -mt-[55px] w-[1080px] rounded-[5px] bg-white p-[30px]">
        <div className="title relative">
          <h2 className="border-b-2 border-black pb-2.5">오늘의 특가</h2>
          <div className="absolute right-0 top-0 text-xl font-bold text-primary [&_span]:text-xl [&_span]:font-bold [&_span]:text-primary">
            <Countdown
              date={moment(todays).add(1, "day").toDate()}
              renderer={renderer}
            ></Countdown>
          </div>
        </div>
        <div
          className="grid grid-cols-[500px_500px] justify-between gap-y-[35px] py-10"
          role="list"
          aria-label="특가 상품 목록"
        >
          {objects &&
            objects?.map((item) => (
              <HotDealCard key={item.object_seq} data={item}></HotDealCard>
            ))}
        </div>
      </div>
    </section>
  );
};

export default StoreHotDeal;
