import styled from "styled-components";
import { theme } from "./styles/theme";

export const Center = styled.div`
  width: 1020px;

  margin: 0 auto;
`;
export const Container = styled.div`
  padding: 40px 0;
  h1 {
    text-align: center;
    margin-bottom: 40px;
  }
  button,
  input[type="password"],
  input[type="text"] {
    width: 400px;
    height: 50px;
    border: 1px solid ${({ theme }) => theme.lineColor.sub};
    font-size: 15px;
    color: #131518;
    border-radius: 6px;
    padding: 0px 20px;
    &:focus {
      border-color: ${({ theme }) => theme.fontColor.main};
      outline: none;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;
export const InputBox = styled.input<{ width: string; height: string | null }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height || "50px"};
  border: 1px solid ${({ theme }) => theme.lineColor.sub};
  font-size: 15px;
  color: #131518;
  border-radius: 6px;
  padding: 0px 10px;
  &::placeholder {
    font-size: 13px;
  }
  &:focus {
    border-color: ${({ theme }) => theme.fontColor.main};
    outline: none;
  }
`;
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 25px;

  button {
    border-color: transparent;
    font-size: 15px;

    &[type="submit"] {
      background-color: ${({ theme }) => theme.color.main};
      color: #fff;
    }

    &[type="button"] {
      background-color: #000;
      color: #fff;
    }
  }

  span {
    font-size: ${({ theme }) => theme.fontSize.middle};
    display: block;
    width: 80px;
  }

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 500px;
    position: relative;
    column-gap: 20px;
    em {
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.fontColor.red};
      position: absolute;
      left: 105px;
      bottom: -16px;
    }
  }

  &.button {
    flex-direction: row;
    width: 500px;
    margin-top: 40px;
    column-gap: 20px;
  }
`;
export const ObjectsBox = styled.div`
  border-top: 1px solid ${({ theme }) => theme.lineColor.main};
  border-bottom: 1px solid ${({ theme }) => theme.lineColor.main};
  padding: 25px 0;
  margin: 45px 0;
  > .tBox {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter {
      display: flex;
      column-gap: 15px;
      align-items: center;
      img {
        cursor: pointer;
      }
      span {
        cursor: pointer;
        position: relative;
        display: block;
        font-size: ${({ theme }) => theme.fontSize.small};
        color: ${({ theme }) => theme.fontColor.sub};
        &::after {
          display: block;
          right: -8px;
          top: 0;
          position: absolute;
          content: " | ";
          font-weight: 400;
        }
        &:last-child::after {
          display: none;
        }
      }
    }
  }

  .bBox {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px 33px;
    margin-top: 40px;
  }
`;
export const MainTitle = styled.div`
  position: relative;
  z-index: 2;

  > div {
    > div {
      display: flex;
      column-gap: 17px;
      align-items: baseline;
      padding-top: 30px;
      em,
      span {
        /* color: #fff; */
      }

      span {
        font-size: 40px;
        font-weight: bold;
      }
      em {
        font-weight: 300;
        font-size: 17px;
      }
    }
  }
`;

export const GreenBtn = styled.button`
  border: 1px solid #9bce26;
  color: #9bce26;
  background: #fff;
  height: 28px;
  padding: 0 5px;
  font-size: 12px !important;
  line-height: 28px;
  border-radius: 5px;
`;

export const Tags = styled.div`
  justify-content: normal !important;
  column-gap: 1px;
  span {
    color: #fff;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: ${theme.fontSize.small};
    margin-right: 2px;
    &.sale {
      background-color: #f65c60;
    }
    &.coupon {
      background-color: #9bce26;
    }
    &.free {
      background-color: #ad85ed;
    }
    &.oneMore {
      background-color: #ff8942;
    }
    &.today_sale {
      background-color: #6fcff7;
    }
  }
`;

export const Info = styled.span`
  font-weight: 600;
  color: red;
`;

export const BlueButton = styled.button<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  line-height: ${({ height }) => height};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.color.main};
  color: #fff;
  white-space: nowrap;
`;
export const WhiteButton = styled.button<{
  width: string | null;
  height: string;
}>`
  width: ${({ width }) => width || "auto"};
  height: ${({ height }) => height};
  line-height: ${({ height }) => height};
  border-radius: 3px;
  background-color: #fff;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.main};
  border: 1px solid ${({ theme }) => theme.color.main};
`;

export const Textarea = styled.textarea<{
  width: string;
  height?: string | null | undefined;
}>`
  width: ${({ width }) => width};
  height: ${({ height }) => height || "120px"};

  border: 1px solid ${({ theme }) => theme.lineColor.sub};
  font-size: 15px;
  color: #131518;
  border-radius: 6px;
  padding: 10px;
  &:focus {
    border-color: ${({ theme }) => theme.fontColor.main};
    outline: none;
  }
  resize: none;
  &::placeholder {
    font-size: 13px;
  }
`;

export const TableStyle = styled.div`
  table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
  }
  thead {
    height: 40px;
    th {
      border-top: 2px solid #d6d6d6;
      border-bottom: 1px solid #ccc;
      background: #fafafa;
      text-align: center;
      padding: 5px;
      color: #666;
      font-size: 14px;
    }
  }

  tbody {
    td {
      border-bottom: 1px solid #ccc;
    }
  }
`;
export const Tabs = styled.div<{ grid: number }>`
  display: grid;
  grid-template-columns: ${({ grid }) => `repeat(${grid}, 1fr)`};
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

export const StarBox = styled.ul<{ size?: string }>`
  display: flex;
  column-gap: 4px;
  li {
    width: ${({ size }) => size ?? "20px"};
    height: ${({ size }) => size ?? "20px"};
    position: relative;
  }
  span {
    position: absolute;
    z-index: 4;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: ${({ size }) => size ?? "20px"};
    background-color: #f27370;
  }
  img {
    width: ${({ size }) => size ?? "20px"};
    height: ${({ size }) => size ?? "20px"};
    z-index: 9;
    position: absolute;
    overflow: hidden;
  }
`;
