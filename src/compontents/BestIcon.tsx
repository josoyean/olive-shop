import styled from "styled-components";
const BestIcon = ({ best, today }: { best: boolean; today: boolean }) => {
  return (
    <Container>
      {best && <Icon className="best-icon">베스트</Icon>}

      {today && <Icon className="today-icon">오특</Icon>}
    </Container>
  );
};

export default BestIcon;
const Container = styled.div`
  position: absolute;
  top: 7px;
  left: 10px;
  display: flex;
  flex-direction: column;
  row-gap: 3px;
`;
const Icon = styled.span`
  display: inline-block;
  width: 48px;
  height: 48px;
  font-size: 14px;
  background: #fff;
  border-radius: 24px;
  border-width: 2px;
  border-style: solid;
  text-align: center;
  font-weight: 700;

  line-height: 44px !important;

  &.best-icon {
    color: #f05a5e;
    border-color: #f05a5e;
  }

  &.today-icon {
    color: #6fcff7;
    border-color: #6fcff7;
  }
`;
