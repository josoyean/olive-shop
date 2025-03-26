import styled from "styled-components";

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

      /* justify-content: flex-end; */
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
