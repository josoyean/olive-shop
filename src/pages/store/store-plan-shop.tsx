import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Center, MainTitle } from "../../../public/assets/style";
import CategoryMenu from "../../compontents/CategoryMenu";
import type { PlanShopType } from "compontents/card/card.type";
import ObjectCardColumn from "../../compontents/card/ObjectCardColumn";
import EmptyComponent from "../../compontents/EmptyComponent";
const StorePlanShopList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const menuType = searchParams.get("menuType");
  const [objects, setObjects] = useState<PlanShopType[]>([]);
  const handleData = useCallback(async () => {
    const { data: planData, error: planError } = await supabase
      .from("planObject")
      .select("*");
    const brandSeqList = planData?.map((item) => item.brand_seq);
    if (brandSeqList?.length === 0) {
      setObjects([]);
      return;
    }
    let query = supabase.from("objects").select("*").eq("soldOut", "False");

    if (menuType !== "전체") {
      query = query.eq("objectTypeMain", menuType);
    }
    query.in("brand_seq", brandSeqList ?? []);
    const { data: objectsData, error: objectsError } = await query;

    const grouped = (brandSeqList ?? []).map((brand_seq) => ({
      ...planData?.find((item) => item.brand_seq === brand_seq),
      objects: objectsData?.filter((obj) => obj.brand_seq === brand_seq),
    }));

    console.log(grouped);
    const groupedFilter = grouped.every((item) => item.objects.length >= 2);
    if (!groupedFilter) {
      setObjects([]);
      return;
    }
    setObjects(grouped ?? []);
  }, [menuType]);
  useEffect(() => {
    handleData();
  }, [handleData]);
  return (
    <div>
      <MainLine>
        <Center>
          <div>
            <span>기획전</span>
            <em>꼭 갖고 싶은 그 상품들! 다양한 혜택까지!</em>
          </div>
        </Center>
      </MainLine>
      <Center>
        <div>
          <CategoryMenu style={{ margin: "-38px 0 0 0" }} />
          <Container $len={objects.length === 0 ? true : false}>
            {objects.length !== 0 && <h2>지금 진행 중인 행사예요</h2>}
            <div>
              {objects && objects?.length > 0 ? (
                <>
                  {objects?.map((object) => (
                    <ObjectContainer key={object?.brand_seq}>
                      <div
                        className="imgBox"
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(
                            `/store/brand-detail?getBrand=${object?.brand_seq}`
                          );
                        }}
                      >
                        <img src={object?.img} alt="" />
                        <p
                          dangerouslySetInnerHTML={{
                            __html: object?.main_text,
                          }}
                        ></p>
                        <em>{object?.sub_text}</em>
                      </div>
                      <div className="textBox">
                        <ObjectCardColumn
                          size="215px"
                          data={object?.objects[0]}
                        />
                        <ObjectCardColumn
                          size="215px"
                          data={object?.objects[1]}
                        />
                      </div>
                    </ObjectContainer>
                  ))}
                </>
              ) : (
                <EmptyComponent
                  mainText="선택 결과가 없어요"
                  subText="기획전 타입을 다시 선택해주세요"
                />
              )}
            </div>
          </Container>
        </div>
      </Center>
    </div>
  );
};

export default StorePlanShopList;
const ObjectContainer = styled.div`
  .imgBox {
    width: 500px;
    height: 330px;
    background-color: red;
    position: relative;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    p {
      position: absolute;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      overflow: hidden;
      font-size: 28px;
      line-height: 31.2px;
      text-align: center;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      position: absolute;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      color: #fff;
      overflow: hidden;
      font-weight: 300;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .textBox {
    width: 475px;
    grid-template-columns: repeat(2, 215px);
    display: grid;
    gap: 20px;
    background-color: #fff;
    margin: -16px 12px 12px;
    padding: 15px 15px 37px;
    z-index: 1;
    position: relative;
    .tags,
    h5 {
      text-align: center;
    }
    /* position: absolute; */
  }
`;

const Container = styled.div<{ $len: boolean }>`
  h2 {
    margin: 60px 0 35px 0;
    text-align: center;
  }
  > div {
    display: ${({ $len }) => ($len ? "unset" : "grid")};
    grid-template-columns: repeat(2, 1fr);
    column-gap: 20px;
  }
`;
const MainLine = styled(MainTitle)`
  height: 150px;
  background: url("/public/assets/images/icons/bg_promo_top.png") 50% 0
    no-repeat;
`;
