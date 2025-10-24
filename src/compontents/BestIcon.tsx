import styled from "styled-components";
const BestIcon = () => {
  return <Icon className="best-icon">베스트</Icon>;
};

export default BestIcon;

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
  color: #f05a5e;

  position: absolute;
  top: 7px;
  left: 10px;
  line-height: 44px !important;
  border-color: #f05a5e;
`;
