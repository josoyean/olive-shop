import React, { useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Center, MainTitle } from "../../../public/assets/style";
import { supabase } from "../../supabase";
import { handleFilter } from "../../bin/common";
import type { EventType } from "../../compontents/card/card.type";
import moment from "moment";
import EmptyComponent from "../../compontents/EmptyComponent";
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
      // 구매회원
      query = query.eq("buy_member", "True");
    }
    const { data } = await query;
    setObjects(data ?? []);
  }, [tabsType]);

  useEffect(() => {
    handleLoadData();
    window.scrollTo(0, 0);
  }, [handleLoadData]);
  return (
    <div>
      <MainLine>
        <Center>
          <div>
            <span>이벤트</span>
            <em>풍성한 이벤트! 즐거운 올리브영</em>
          </div>
        </Center>
      </MainLine>
      <Center>
        <div>
          <Tabs>
            <div className={tabsType === "모든회원" ? "on" : ""}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setSearchParams({
                    tabsType: "모든회원",
                  });
                }}
              >
                모든회원
              </button>
            </div>
            <div className={tabsType === "구매회원" ? "on" : ""}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setSearchParams({
                    tabsType: "구매회원",
                  });
                }}
              >
                구매회원
              </button>
            </div>
            <div className={tabsType === "체험단" ? "on" : ""}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  alert("준비중 입니다");
                  return;
                }}
              >
                체험단
              </button>
            </div>
          </Tabs>
          <Container $len={objects.length === 0 ? true : false}>
            {objects.length === 0 ? (
              <EmptyComponent
                mainText="선택 결과가 없어요"
                subText="이벤트 타입을 다시 선택해주세요"
              />
            ) : (
              objects.map((item, index) => (
                <div
                  className="objects"
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
                    window.scrollTo(0, 0);
                  }}
                >
                  <img className="event-img" src={item.img} alt="event-img" />
                  {(item.off_line || item.on_line) && (
                    <Tags
                      $color={
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
                    </Tags>
                  )}
                  <div className="text-wrap">
                    <strong>{item.main_title}</strong>
                    <p className="sub-title">{item.sub_title}</p>
                    <p className="date">
                      {moment(item.start_date).format("YYYY-MM-DD")} ~{" "}
                      {moment(item.end_date).format("YYYY-MM-DD")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Container>
        </div>
      </Center>
    </div>
  );
};

export default StoreEvents;
const Tags = styled.span<{ $color: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  min-width: 100px;
  text-align: center;
  color: #fff;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ $color }) =>
    $color === "온&오프라인"
      ? "#d87299"
      : $color === "오프라인몰"
      ? "#9f87c9"
      : "#9bce26"};
  border-radius: 20px;
`;
const Container = styled.div<{ $len: boolean }>`
  display: ${({ $len }) => ($len ? "unset" : "grid")};
  grid-template-columns: repeat(3, 330px);
  row-gap: 50px;
  margin-bottom: 50px;
  justify-content: space-between;
  .objects {
    cursor: pointer;
    width: 330px;
    position: relative;
  }
  .event-img {
    width: 330px;
    display: block;
    height: 176px;
  }
  .text-wrap {
    text-align: center;

    strong {
      overflow: hidden;
      height: 30px;
      margin: 16px 0 1px;
      font-size: 21px;
      color: #333;
      display: inline-block;
      line-height: 30px;
    }
    .sub-title {
      overflow: hidden;
      height: 20px;
      color: #777;
      line-height: 20px;
      letter-spacing: -0.02em;
      word-break: break-all;
    }
    .date {
      margin: 11px 0 0;
      color: #888;
      font-size: 14px;
      text-align: center;
      font-weight: 700;
    }
  }
`;
const MainLine = styled(MainTitle)`
  height: 100px;
  background: url("/public/assets/images/icons/bg_event_top1.png") 50% 0
    no-repeat;

  > div {
    > div {
      padding-top: 30px;
      em,
      span {
        color: #000;
      }
    }
  }
`;
const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 30px 0 40px;
  > div {
    text-align: center;

    position: relative;
    button {
      height: 50px;
      line-height: 50px;
      background: #f6f6f6;
      color: #666;
      font-size: 18px;
      font-weight: 400;
      width: 100%;
    }

    &.on {
      button {
        color: #fff;
        background: #555;
        &::after {
          position: absolute;
          content: "";
          bottom: -5px;
          left: 50%;
          width: 12px;
          height: 5px;
          margin-left: -6px;
          background: url(https://static.oliveyoung.co.kr/pc-static-root/image/comm/bg_tab_arrow.png)
            no-repeat;
        }
      }
    }
  }
`;
