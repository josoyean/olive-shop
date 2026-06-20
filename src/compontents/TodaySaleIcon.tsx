import styled from "styled-components";
const TodaySaleIcon = () => {
  return <Icon className="best-icon">오특</Icon>;
};

export default TodaySaleIcon;

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
  color: #6fcff7;

  position: absolute;
  top: 30px;
  left: 10px;
  line-height: 44px !important;
  border-color: #6fcff7;
`;
