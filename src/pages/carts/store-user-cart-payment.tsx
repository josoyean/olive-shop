import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { useForm, FieldErrors } from "react-hook-form";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { GreenBtn } from "../../../public/assets/style";

interface Time {
  nanoseconds: number;
}
interface UserInfo {
  [key: string]: string;
}
interface DataType {
  getName: string;
  phoneNumber: string;
  addressMain: string;
  addressSub: string;
  name: string;
  birthDy: string;
  code: string;
  email: string;
  postNumber: string;
}
const StoreUserPayment = () => {
  const locatiton = useLocation();
  const userToken = useSelector((state: RootState) => state?.user.token);
  const [user, setUser] = useState<UserInfo>({});

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    reset,
    getValues,
    formState: { errors, touchedFields },
  } = useForm<DataType>({
    mode: "onChange",
    defaultValues: {},
  });
  const userInfo = async () => {
    try {
      const usersRef = collection(db, "users"); // users 컬렉션 참조
      const id = query(usersRef, where("userId", "==", userToken)); // 특정 이메일 찾기

      // 특정 이메일 찾기

      const idSnapshot = await getDocs(id);

      if (!idSnapshot.empty) {
        const data = idSnapshot.docs[0].data();
        setValue("phoneNumber", data?.phoneNumber);
        setValue("getName", data?.name);
        setValue("addressMain", data?.addressMain);
        setValue("addressSub", data?.addressSub);
        setValue("postNumber", data?.postNumber);
        setUser(data);
      }
    } catch (error) {}
  };
  useEffect(() => {
    userInfo();
  }, []);
  const onSubmit = async (data: DataType) => {};
  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus(errorKeys[0]);
    }
  };

  return (
    <Container>
      <div className="title-box">
        <h2>주문 / 결제</h2>
      </div>

      <TableBox onSubmit={handleSubmit(onSubmit, onError)}>
        <div>
          <h3>배송지정보</h3>
          <table>
            <tr>
              <th>배송지명</th>
              <td>{user?.name ?? ""}</td>
            </tr>
            <tr>
              <th>
                받은분 <span>*</span>
              </th>
              <td>
                <input
                  type="text"
                  placeholder="받은분"
                  {...register("getName", {
                    required: "받는분을 입력하세요.",
                    minLength: {
                      value: 2,
                      message: "받는분을 정확하게 입력해주세요",
                    },
                  })}
                />
              </td>
            </tr>
            <tr>
              <th>
                연락처 <span>*</span>
              </th>
              <td>
                <input
                  type="text"
                  {...register("phoneNumber", {
                    required: "연락처를 입력하세요.",
                  })}
                />
              </td>
            </tr>
            <tr className="address">
              <th>
                주소 <span>*</span>
              </th>
              <td>
                <div>
                  <div className="post">
                    <input
                      type="text"
                      {...register("postNumber", {
                        required: "우편번호를 입력하세요.",
                      })}
                      disabled
                    />
                    <GreenBtn
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        alert("준비중입니다");
                      }}
                    >
                      우편번호 찾기
                    </GreenBtn>
                  </div>
                  <input
                    type="text"
                    {...register("addressMain", {
                      required: "주소를 입력하세요.",
                    })}
                    disabled
                  />
                  <input type="text" {...register("addressSub")} />
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div>
          <h3>배송지 요청사항</h3>
          <table>
            <tr>
              <th>배송 메시지</th>
              <td>
                <input
                  type="text"
                  placeholder="받은분"
                  {...register("getName", {})}
                />
              </td>
            </tr>
            <tr>
              <th>
                공동현관 출입방법 <span>*</span>
              </th>
              <td>체크박스</td>
            </tr>
            <tr className="">
              <th>
                공동현관 비밀번호 <span>*</span>
              </th>
              <td>
                <input type="text" {...register("addressSub")} />
              </td>
            </tr>
            <tr className="">
              <th>출입정보 저장</th>
              <td>배송 관련 정보 수정 시, 기존 배송지 정보에 반영됩니다.</td>
            </tr>
          </table>
        </div>
      </TableBox>
    </Container>
  );
};

/* 결제 정보 */
const Container = styled.div`
  padding: 20px;
  margin-top: -20px;
  background-color: #fff;
  z-index: 9;
  position: relative;
  border-radius: 5px;
  div.title-box {
    border-top: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    .gray_btn {
      width: 90px;
    }
  }

  input[type="text"] {
    width: 400px;
    height: 28px;
    border: 1px solid ${({ theme }) => theme.lineColor.sub};
    font-size: 15px;
    color: #131518;
    border-radius: 6px;
    padding: 0px 5px;
    &:focus {
      border-color: #116dff;

      outline: none;
    }
  }
`;
const TableBox = styled.form`
  h3 {
    font-weight: 300;
  }

  table {
    margin: 10px 0;
    width: 100%;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    tr {
      border-bottom: 1px solid #e6e6e6;
      th {
        padding: 15px;
        width: 170px;
        background: #f4f4f4;
        border-bottom: 1px solid #e6e6e6;
        text-align: left;
        color: #222;
        span {
          font-weight: 600;
          color: red;
        }
      }
      td {
        padding: 15px;
        font-size: 15px;
        border-bottom: 1px solid #e6e6e6;
      }
    }

    .post {
      input[type="text"] {
        width: 120px;
        margin-right: 20px;
      }
      button {
        border: 1px solid #116dff;
        color: #116dff;
        background: #fff;
        width: 100px;
      }
    }

    .address td > div {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }
  }
`;
export default StoreUserPayment;
