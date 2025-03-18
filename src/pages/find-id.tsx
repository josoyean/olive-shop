import React, { useState } from "react";
import styled from "styled-components";
import { useForm, FieldErrors } from "react-hook-form";
import { Center, Container, InputWrapper } from "../../public/assets/style";
import { ErrorMessage } from "@hookform/error-message";
import { formatPhoneNumber, numberOnly } from "../bin/common";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
interface DataType {
  name: string;
  birthDy: string;
  phoneNumber: string;
  code: string;
}
interface CheckedType {
  [key: string]: boolean;
}
const FindId = () => {
  const [verificationId, setVerificationId] = useState<string>("");
  const [checked, setChecked] = useState<CheckedType>({
    phone: false,
    code: false,
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const navigate = useNavigate();
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

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible", // reCAPTCHA v2 (보이지 않는) 방식
        callback: (response) => {
          console.log("reCAPTCHA solved", response);
        },
        "expired-callback": () => console.log("reCAPTCHA 만료됨"),
      }
    );
  };

  const onError = (errors: FieldErrors<DataType>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus(errorKeys[0]);
    }
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
      const nameSnapshot = await getDocs(name);
      const phoneSnapshot = await getDocs(phone);
      const birthDaySnapshot = await getDocs(birthDay);

      if (
        !nameSnapshot.empty &&
        !phoneSnapshot.empty &&
        !birthDaySnapshot.empty
      ) {
        const data = nameSnapshot.docs[0].data();
        alert(
          `회원님의 아이디는 <${data.id}>입니다.\n로그인 페이지로 이동합니다.`
        );
        navigate("/login");
        return nameSnapshot.docs[0].data(); // 첫 번째 결과 리턴
      } else {
        alert(`해당 정보를 가진 사용자가 없습니다. \n회원가입 해주세요`);
        return null;
      }
    } catch (error) {}
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
      const appVerifier = window.recaptchaVerifier;
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
        <h1>아이디 찾기</h1>
        <FormControl onSubmit={handleSubmit(onSubmit, onError)}>
          <InputWrapper className="input-wrapper">
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
            <button type="submit">아이디 찾기</button>
          </InputWrapper>
        </FormControl>
      </Container>
    </Center>
  );
};
export default FindId;

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
