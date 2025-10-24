import { useEffect, useState } from "react";
import { Center, MainTitle } from "../../../public/assets/style";
import styled from "styled-components";
import { supabase } from "../../supabase";
import HotDealCard from "../../compontents/card/HotDealCard";
import type { CardImageType } from "compontents/card/card.type";
import { theme } from "../../../public/assets/styles/theme";
import moment from "moment";
import Countdown, { CountdownRenderProps } from "react-countdown";

const StoreHotDeal = () => {
  const [objects, setObjects] = useState<CardImageType[]>([]);
  const todays = moment().format("YYYY-MM-DD");
  const today = new Date().toISOString().split("T")[0];
  const handleData = async () => {
    const { data, error } = await supabase
      .from("objects")
      .select("*, saleItem(*)")
      .not("saleItem", "is", null)
      .eq("saleItem.today_sale_date", today);

    if (!data) return;
    setObjects(data ?? []);
    if (error) {
      console.error("Supabase Error:", error);
    }
  };
  // 두 자리 숫자로 맞춰주는 함수
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
    <div>
      <MainLine>
        <Center>
          <div>
            <span>오늘의 특가</span>
            <em>딱 하루만! 오늘의 특가 찬스</em>
          </div>
        </Center>
      </MainLine>
      <ObjectBox>
        <div className="title">
          <h2>오늘의 특가</h2>
          <Countdown
            date={moment(todays).add(1, "day").toDate()}
            renderer={renderer}
          ></Countdown>
        </div>
        <div className="items">
          {objects &&
            objects?.map((item) => (
              <HotDealCard key={item.object_seq} data={item}></HotDealCard>
            ))}
        </div>
      </ObjectBox>
    </div>
  );
};

export default StoreHotDeal;
const ObjectBox = styled.div`
  padding: 30px;
  background-color: #fff;
  margin: -55px auto 0;
  z-index: 99;
  position: relative;
  border-radius: 5px;
  width: 1080px;
  .title {
    position: relative;
    h2 {
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
    }
    span {
      font-size: 20px;
      font-weight: bold;
      color: ${theme.color.main};
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  > div.items {
    display: grid;
    grid-template-columns: repeat(2, 500px);
    justify-content: space-between;
    row-gap: 35px;
    padding: 40px 0;
  }
`;

const MainLine = styled(MainTitle)`
  height: 150px;
  background: url("/public/assets/images/icons/bg_sp_visual.png") 50% 0
    no-repeat;

  > div {
    > div {
      padding-top: 30px;
      em,
      span {
        color: #fff;
      }
    }
  }
`;
