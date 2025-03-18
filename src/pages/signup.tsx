import React, { useEffect, useState } from "react";
import { Center, InputWrapper, Container } from "../../public/assets/style";
import styled from "styled-components";
import { useForm, FieldErrors } from "react-hook-form";
import firebase from "firebase/app";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
// import { getFirestore, doc, setDoc } from "firebase/firestore";
import "firebase/auth";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithCredential,
  PhoneAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import { ErrorMessage } from "@hookform/error-message";
import { formatPhoneNumber, numberOnly } from "../bin/common";
import { Email, Tune } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CheckedType } from "../types/userInfor";
interface DataType {
  id: string;
  password: string;
  passwordAgain: string;
  saveId: boolean;
  name: string;
  birthDy: string;
  phoneNumber: string;
  code: string;
  email: string;
}

const SignUp = () => {
  const {
    register,
    handleSubmit,
    // required,
    setFocus,
    setValue,
    reset,
    getValues,
    formState: { errors, touchedFields },
  } = useForm<DataType>({
    mode: "onChange",
    defaultValues: {},
  });
  const [verificationId, setVerificationId] = useState<string>("");
  const [checked, setChecked] = useState<CheckedType>({
    phone: false,
    code: false,
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible", // reCAPTCHA v2 (보이지 않는) 방식
        callback: (response: any) => {
          console.log("reCAPTCHA solved", response);
        },
        "expired-callback": () => console.log("reCAPTCHA 만료됨"),
      }
    );
  };
  const onSubmit = async (data: DataType) => {
    if (!checked.phone) {
      alert("인증번호 전송해주세요");
      return;
    }
    if (!checked.code) {
      alert("인증번호 확인 완료해주세요");
      return;
    }

    try {
      const usersRef = collection(db, "users"); // users 컬렉션 참조
      const name = query(usersRef, where("name", "==", data.name)); // 특정 이메일 찾기
      const phone = query(
        usersRef,
        where("phoneNumber", "==", data.phoneNumber)
      );

      // 특정 이메일 찾기
      const birthDay = query(usersRef, where("birthDy", "==", data.birthDy)); // 특정 이메일 찾기
      const email = query(usersRef, where("email", "==", data.email)); // 특정 이메일 찾기
      const nameSnapshot = await getDocs(name);
      const phoneSnapshot = await getDocs(phone);
      const birthDaySnapshot = await getDocs(birthDay);
      const emailSnapshot = await getDocs(email);

      if (
        !nameSnapshot.empty &&
        !phoneSnapshot.empty &&
        !emailSnapshot.empty &&
        !birthDaySnapshot.empty
      ) {
        const data = nameSnapshot.docs[0].data();

        if (data.name !== "") {
          alert("이미 가입된 이메일입니다. 로그인해주세요!");
          return;
        }
      }

      const createdUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = createdUser.user;
      await setDoc(doc(db, "users", user.uid), {
        createdAt: new Date(),
        birthDy: data.birthDy,
        phoneNumber: data.phoneNumber,
        name: data.name,
        id: data.id,
        email: data.email,
        userId: user.uid,
      });
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus(errorKeys[0]);
    }
  };

  // 타이머 설정
  const timer = () => {
    if (isTimerRunning) return; // 타이머가 이미 실행 중이면 추가 실행 방지

    setIsTimerRunning(true);
    setChecked((prevState) => ({ ...prevState, phone: true }));

    setTimeout(() => {
      if (isTimerRunning) {
        setChecked((prevState) => ({ ...prevState, phone: false }));
      }
    }, 10000);
  };

  // 타이머 멈추는 버튼
  const stopTimer = () => {
    setIsTimerRunning(false); // 타이머 상태 초기화
  };
  const codeSend = async () => {
    const phone = formatPhoneNumber(getValues("phoneNumber"));

    try {
      setupRecaptcha(); // reCAPTCHA 설정
      const appVerifier = window?.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setVerificationId(result.verificationId);
      timer();
    } catch (error) {
      console.error("SMS 전송 오류:", error);
    }
  };
  const verifyCode = async (code: string) => {
    try {
      // 입력된 인증 코드로 Firebase 인증을 진행
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);

      alert("인증코드 확인 완료");
      setChecked((prevState) => ({ ...prevState, code: true }));
      return userCredential; // 인증 성공한 사용자 정보
    } catch (error) {
      alert("인증 코드가 일치하지 않습니다");
      console.error("인증 실패:", error);
    }
  };

  return (
    <Center>
      <div id="recaptcha-container"></div>
      <Container>
        <h1>회원가입</h1>
        <FormControl onSubmit={handleSubmit(onSubmit, onError)}>
          <InputWrapper className="input-wrapper">
            <div>
              <span>아이디</span>
              <input
                type="text"
                placeholder="OLIVE SHOP 아이디"
                {...register("id", {
                  required: "아이디를 입력하세요.",
                  minLength: {
                    value: 5,
                    message: "아이디는 5자리 이상이어야 합니다.",
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name="id"
                render={({ message }) =>
                  touchedFields.id ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>비밀번호</span>
              <input
                type="password"
                placeholder="비밀번호 (8~12자, 영문+숫자+특수문자)"
                {...register("password", {
                  pattern: {
                    value:
                      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
                    message:
                      "비밀번호는 8~15 자리 영문,숫자,특수문자를 포함해야 합니다.",
                  },
                  maxLength: {
                    value: 15,
                    message: "비밀번호는 15자리 이하로 입력하세요.",
                  },
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자리 이상로 입력하세요.",
                  },
                  required: "비밀번호를 입력해주세요",
                })}
              />
              <ErrorMessage
                errors={errors}
                name="password"
                render={({ message }) =>
                  touchedFields.password ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>비밀번호 확인</span>
              <input
                type="password"
                placeholder="비밀번호 (8~12자, 영문+숫자+특수문자)"
                {...register("passwordAgain", {
                  pattern: {
                    value:
                      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
                    message:
                      "비밀번호는 8~15 자리 영문,숫자,특수문자를 포함해야 합니다.",
                  },
                  required: "비밀번호를 입력해주세요",
                  maxLength: {
                    value: 15,
                    message: "비밀번호는 15자리 이하로 입력하세요.",
                  },
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자리 이상로 입력하세요.",
                  },
                  validate: (value, formValues) => {
                    return (
                      value === formValues.password || "비밀번호가 다릅니다."
                    );
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name="passwordAgain"
                render={({ message }) =>
                  touchedFields.passwordAgain ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>이름</span>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                {...register("name", { required: "이름을 입력하세요." })}
              />
              <ErrorMessage
                errors={errors}
                name="name"
                render={({ message }) =>
                  touchedFields.name ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>이메일</span>
              <input
                type="text"
                placeholder="이메일을 입력해주세요."
                {...register("email", {
                  required: "이메일을 입력하세요.",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "이메일 주소를 확인하세요.",
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name="email"
                render={({ message }) =>
                  touchedFields.email ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>생년월일</span>
              <input
                type="text"
                placeholder="법정생년월일 6자리를 입력해주세요."
                maxLength={6}
                {...register("birthDy", {
                  required: "생년월일을 입력하세요.",
                  minLength: {
                    value: 6,
                    message: "법정생년월일 6자리를 입력하세요.",
                  },
                  pattern: {
                    value:
                      /([0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1,2][0-9]|3[0,1]))/,
                    message: "법정생년월일을 확인해세요",
                  },
                })}
                onChange={(e) => {
                  const filteredValue = numberOnly(e.target.value);
                  setValue("birthDy", filteredValue); // 필터링한 값으로 업데이트
                }}
              />
              <ErrorMessage
                errors={errors}
                name="birthDy"
                render={({ message }) =>
                  touchedFields.birthDy ? <em>{message}</em> : null
                }
              />
            </div>

            <div>
              <span>핸드폰번호</span>
              <Buttom>
                <input
                  type="text"
                  placeholder="핸드폰번호를 입력해주세요"
                  maxLength={11}
                  {...register("phoneNumber", {
                    required: "핸드폰번호를 입력하세요.",
                    minLength: {
                      value: 11,
                      message: "핸드폰번호를 11자리를 입력하세요.",
                    },
                  })}
                  onChange={(e) => {
                    const filteredValue = numberOnly(e.target.value);
                    setValue("phoneNumber", filteredValue); // 필터링한 값으로 업데이트
                    setChecked({ phone: false, code: false });
                  }}
                />
                <button
                  type="button"
                  className={`${checked.phone && "action"}`}
                  onClick={() => {
                    if (getValues("phoneNumber").length !== 11) {
                      alert("핸드폰번호를 확인해주세요");
                      return;
                    }
                    if (checked.phone) return;

                    codeSend();
                  }}
                >
                  인증번호 전송
                </button>
              </Buttom>
              <ErrorMessage
                errors={errors}
                name="phoneNumber"
                render={({ message }) =>
                  touchedFields.phoneNumber ? <em>{message}</em> : null
                }
              />
            </div>
            <div>
              <span>인증번호</span>
              <Buttom>
                <input
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  maxLength={6}
                  {...register("code", {
                    required: "인증번호를 입력하세요.",
                    minLength: {
                      value: 6,
                      message: "인증번호를 6자리를 입력하세요.",
                    },
                  })}
                  onChange={(e) => {
                    const filteredValue = numberOnly(e.target.value);
                    setValue("code", filteredValue); // 필터링한 값으로 업데이트
                  }}
                />
                <button
                  type="button"
                  className={`${checked.code && "action"}`}
                  onClick={() => {
                    // reset();
                    if (!checked.phone) {
                      alert("인증번호 전송을 해주세요");
                      return;
                    }
                    if (getValues("code").length !== 6) {
                      alert("인증번호를 확인해주세요");
                      return;
                    }
                    verifyCode(getValues("code"));
                    stopTimer();
                  }}
                >
                  인증번호 확인
                </button>
              </Buttom>
              <ErrorMessage
                errors={errors}
                name="code"
                render={({ message }) =>
                  touchedFields.code ? <em>{message}</em> : null
                }
              />
            </div>
          </InputWrapper>

          <InputWrapper className="button">
            <button
              type="button"
              onClick={() => {
                reset();
              }}
            >
              초기화
            </button>
            <button type="submit">회원가입</button>
          </InputWrapper>
        </FormControl>
      </Container>
    </Center>
  );
};
export default SignUp;
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

const Buttom = styled.div`
  display: flex;
  align-items: center;
  width: 400px;
  justify-items: center;
  column-gap: 30px;
  input[type="text"] {
    width: 300px;
  }
  button[type="button"] {
    width: 100px;
    background-color: ${({ theme }) => theme.color.main};
    color: #fff;
    &.action {
      background-color: #000;
      color: #fff;
    }
  }
`;
const FormControl = styled.form``;
