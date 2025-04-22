import React, { useEffect } from "react";
import { Center, Container } from "../../public/assets/style";
import styled from "styled-components";
import { useForm, FieldErrors } from "react-hook-form";
import { auth, db } from "../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redex/store";
import { add, type UserInfoType } from "../redex/reducers/userReducer";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { handleCartItems } from "../bin/common";
// import { createUserWithEmailAndPassword } from "firebase/auth";
interface DataType {
  id: string;
  password: string;
  saveId: boolean;
}
const Login = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const user = useSelector((state: RootState) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    // required,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DataType>({
    defaultValues: { saveId: user.saveId },
  });

  const handleSignin = async (email: string, data: DataType) => {
    await signInWithEmailAndPassword(auth, email, data.password)
      .then((userCredential) => {
        const token = userCredential.user.uid;

        dispatch(
          add({
            token: token,
            saveId: data.saveId,
            ...(data.saveId ? { userId: data.id } : {}),
          })
        );
        handleCartItems(token, dispatch, false);
        navigate("/");
      })
      .catch((error) => {
        alert("일치한 회원정보가 없습니다.");
        return;
      });
  };

  const onSubmit = async (data: DataType) => {
    console.log(currentUser);
    try {
      const usersRef = collection(db, "users"); // users 컬렉션 참조
      const id = query(usersRef, where("id", "==", data.id)); // 특정 이메일 찾기

      const idSnapshot = await getDocs(id);
      if (!idSnapshot.empty) {
        const email = idSnapshot.docs[0].data().email;
        handleSignin(email, data);
      }
    } catch (error) {
      console.log(error);
      console.error(error);
    }
  };

  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus(errorKeys[0]);
      alert(errors[errorKeys[0]]?.message || "Form validation error");
    }
  };

  useEffect(() => {
    setValue("saveId", user.saveId);
    if (user.saveId) {
      setValue("id", user.userId || "");
    }
  }, []);
  return (
    <Center>
      <Container style={{ height: "calc(100vh - 311px)", minHeight: "515px" }}>
        <h1>로그인</h1>
        <FormControl onSubmit={handleSubmit(onSubmit, onError)}>
          <InputWrapper className="input-wrapper">
            <input
              type="text"
              placeholder="OLIVE SHOP 아이디"
              {...register("id", { required: "아이디를 입력하세요." })}
            />
            <input
              type="password"
              placeholder="비밀번호 (8~12자, 영문+숫자+특수문자)"
              {...register("password", {
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
                  message:
                    "비밀번호는 8~15 자리 영문,숫자,특수문자를 포함해야 합니다.",
                },
              })}
            />
          </InputWrapper>
          <LabelWrapper>
            <label htmlFor="">
              <input
                type="checkbox"
                placeholder="아이디 저장"
                {...register("saveId")}
                onChange={(event) => {
                  setValue("saveId", event.target.checked);
                }}
              />
              아이디 저장
            </label>
            <div>
              <span
                onClick={() => {
                  navigate("/member/find-id");
                }}
              >
                아이디 찾기
              </span>
              <span
                onClick={() => {
                  navigate("/member/find-password");
                }}
              >
                비밀번호 변경
              </span>
            </div>
          </LabelWrapper>

          <InputWrapper className="input-wrapper">
            <button type="submit">로그인</button>
            <button
              type="button"
              onClick={() => {
                navigate("/signup");
              }}
            >
              회원가입
            </button>
          </InputWrapper>
        </FormControl>
      </Container>
    </Center>
  );
};
export default Login;
// height: calc(100vh - 308px);
const LabelWrapper = styled.div`
  display: flex;
  width: 400px;
  align-items: center;
  justify-content: space-between;
  margin: 15px 0 30px;
  label {
    font-size: ${({ theme }) => theme.fontSize.middle};
    color: ${({ theme }) => theme.fontColor.sub};
    display: flex;
    align-items: center;
    input[type="checkbox"] {
      margin-right: 05px;
    }
  }
  span {
    cursor: pointer;
    position: relative;
    display: block;
    float: left;
    margin-left: 15px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.fontColor.sub};
    &::after {
      display: block;
      right: -8px;
      top: 0;
      position: absolute;
      content: " | ";
    }
    &:last-child::after {
      display: none;
    }
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;

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
`;

const FormControl = styled.form``;
