import type { RootState } from "redex/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

const SideBar = () => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const productData = useSelector((state: RootState) => state?.recentProducts);
  const [startScrollY, setStartScrollY] = useState<number>(650);
  const [barPosition, setBarPosition] = useState<number>(650);

  const handleScroll = useCallback(() => {
    const barHeight = barRef?.current?.clientHeight ?? 0;
    const boxCenter = (window.innerHeight - barHeight) * 0.5;

    if (startScrollY - window.pageYOffset > boxCenter) {
      setBarPosition(startScrollY - window.pageYOffset);
    } else {
      setBarPosition(boxCenter);
    }
  }, [location.pathname, startScrollY]);

  useEffect(() => {
    if (!barRef?.current) return;
    if (location.pathname !== "/") {
      setStartScrollY(200);
      setBarPosition(200);
    } else {
      setStartScrollY(650);
      setBarPosition(650);
    }
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      {productData.length !== 0 && (
        <Container style={{ top: barPosition + "px" }} ref={barRef}>
          <h4>
            최근 본 상품 <span>{productData.length}</span>
          </h4>

          <div>
            {productData?.map(
              (data, index) =>
                index < 5 && (
                  <ProductBox
                    key={index}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(
                        `/store/goods-detail?getGoods=${data?.object_seq}`
                      );
                    }}
                  >
                    <img src={data?.img} alt={data?.name} />
                    {data.soldOut && <span>품절</span>}
                  </ProductBox>
                )
            )}
          </div>
        </Container>
      )}
    </>
  );
};

export default SideBar;
const ProductBox = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.lineColor.main};
  position: relative;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    position: absolute;
    height: 22px;
    text-align: center;
    line-height: 22px;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;

    border-radius: 0 0 10px 10px;
    display: block;
  }
`;
const Container = styled.div`
  position: fixed;
  left: calc((100vw - 1020px) / 2 - 190px); /* 왼쪽 여백 */
  width: 130px;
  padding-top: 5px;
  border-radius: 10px;
  z-index: 999;
  background-color: #fff;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.lineColor.main};

  h4 {
    font-size: ${({ theme }) => theme.fontSize.middle};
    font-weight: normal;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    span {
      text-align: center;
      font-size: 14px;
      color: #fff;
      margin-left: 10px;
      display: inline-block;
      line-height: 20px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #666;
    }
  }

  > div {
    margin: 15px 0;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    align-items: center;
  }
`;
