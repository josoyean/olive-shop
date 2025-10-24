import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redex/store";
import styled from "styled-components";
import { clearProducts } from "../redex/reducers/recentProductsData";
import EmptyComponent from "../compontents/EmptyComponent";
import ObjectCardColumn from "../compontents/card/ObjectCardColumn";
import { theme } from "../../public/assets/styles/theme";
import { ClickAwayListener, ClickAwayListenerProps } from "@mui/material";
const RecentProducts = ({
  onClickAway,
  onClose,
}: {
  onClickAway: ClickAwayListenerProps["onClickAway"];
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const productData = useSelector((state: RootState) => state?.recentProducts);

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <ItemsContainer>
        <div className="header">
          <h2>
            전체 <em>{productData?.length}</em>개
          </h2>
          <button
            onClick={(event) => {
              event.preventDefault();
              dispatch(clearProducts());
            }}
          >
            전체 삭제
          </button>
        </div>
        <div className="wrapper">
          {productData?.length > 0 ? (
            <Container>
              {productData?.map((item, index) => (
                <ObjectCardColumn
                  size="180px"
                  key={index}
                  data={item}
                  onClick={() => {
                    onClose();
                  }}
                />
              ))}
            </Container>
          ) : (
            <EmptyComponent
              mainText="최근 본 상품이 없어요"
              subText=""
            ></EmptyComponent>
          )}
        </div>
      </ItemsContainer>
    </ClickAwayListener>
  );
};
const ItemsContainer = styled.div`
  min-height: 400px;

  .header {
    padding: 3px 0 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.lineColor.main};
    h2 {
      em {
        color: #116dff;
      }
    }
    button {
      padding: 3px 8px;
      font-size: 14px;
      border: 1px solid ${({ theme }) => theme.lineColor.main};
    }
  }

  .wrapper {
    /* background-color: red; */
  }
`;
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 180px);
  justify-content: space-around;
  row-gap: 30px;
  padding: 20px 0;
  .object_box {
    position: relative;
    > span {
      width: 48px;
      height: 48px;
      background-color: #fff;
      text-align: center;
      border-radius: 50%;
      line-height: 48px;
      display: block;
      font-size: 20px;
      font-weight: bold;
      color: ${theme.color.main};
      position: absolute;
      left: -22px;
      z-index: 9;
      top: 12px;
      border: 2px solid ${theme.color.main};
      cursor: pointer;
    }
  }
  .best-icon {
    display: none;
  }
  .tags {
    margin-top: 5px;
  }
  .tags,
  h5 {
    text-align: center;
  }
`;
export default RecentProducts;
