import React, { useState } from "react";
import styled from "styled-components";
import { useForm, FieldErrors } from "react-hook-form";
import { Center, Container, InputWrapper } from "../../public/assets/style";
import { auth } from "../firebase";
import { ErrorMessage } from "@hookform/error-message";
import type { CheckedType } from "../types/userInfor";
import { formatPhoneNumber, numberOnly, setupRecaptcha } from "../bin/common";
import {
  signInWithPhoneNumber,
  sendPasswordreset1Email,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import { getFindId } from "../api/axios-index";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
interface DataType1 {
  id: string;
  saveId: boolean;
  name: string;
  birthDy: string;
  phoneNumber: string;
  code: string;
  email: string;
}
interface DataType2 {
  password: string;
  passwordAgain: string;
}

const FindPassword = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<CheckedType>({
    phone: true,
    code: true,
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isPassword, setPassword] = useState<boolean>(false);
  const [verificationId, setVerificationId] = useState<string>("");
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setFocus: setFocus1,
    setValue: setValue1,
    reset: reset1,
    getValues: getValues1,
    formState: { errors: errors1, touchedFields: touchedFields1 },
  } = useForm<DataType1>({
    mode: "onChange",
    defaultValues: {
      name: "조소연",
      birthDy: "961016",
      phoneNumber: "01077337236",
      code: "000000",
      id: "sykor1016",
      email: "dlfjswhtnals@naver.com",
    },
  });
  const {
    register: register2,
    handleSubmit: handleSubmit2,

    formState: { errors: errors2, touchedFields: touchedFields2 },
  } = useForm<DataType2>({
    mode: "onChange",
    defaultValues: {
      passwordAgain: "@uw7905vf@",
      password: "@uw7905vf@",
    },
  });
  const onSubmit1 = async (data: DataType1) => {
    if (!checked.phone) {
      alert("인증번호 전송해주세요");
      return;
    }
    if (!checked.code) {
      alert("인증번호 확인 완료해주세요");
      return;
    }
    getFindId(data)
      .then((data) => {
        setPassword(true);
        console.log(data);
      })
      .catch((error) => {
        if (error.code === "PGRST116") {
          if (
            window.confirm(
              "해당 정보를 가진 사용자가 없습니다. 회원가입 페이지로 이동하겠습니까?"
            )
          ) {
            navigate("/signup");
          }
        }
      });
  };
  const onSubmit2 = async (data: DataType2) => {
    const { data: update, error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (!update.user) {
      alert("비밀번호 변경이 완료 되었습니다.");
      navigate("/login");
    }
  };
  const onError1 = (errors: FieldErrors<DataType1>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus1(errorKeys[0]);
    }
  };

  const onError2 = (errors: FieldErrors<DataType2>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFocus1(errorKeys[0]);
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
    const phone = formatPhoneNumber(getValues1("phoneNumber"));

    try {
      // setupRecaptcha(); // reCAPTCHA 설정
      setupRecaptcha();
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
      <Container style={{ height: "calc(100vh - 311px)", minHeight: "570px" }}>
        <h1>비밀번호 변경</h1>
        {isPassword ? (
          <form action="" onSubmit={handleSubmit2(onSubmit2, onError2)}>
            <InputWrapper className="input-wrapper">
              <div>
                <span>비밀번호</span>
                <input
                  type="password"
                  placeholder="비밀번호 (8~12자, 영문+숫자+특수문자)"
                  {...register2("password", {
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
                  errors={errors2}
                  name="password"
                  render={({ message }) =>
                    touchedFields2.password ? <em>{message}</em> : null
                  }
                />
              </div>
              <div>
                <span>비밀번호 확인</span>
                <input
                  type="password"
                  placeholder="비밀번호 (8~12자, 영문+숫자+특수문자)"
                  {...register2("passwordAgain", {
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
                  errors={errors2}
                  name="passwordAgain"
                  render={({ message }) =>
                    touchedFields2.passwordAgain ? <em>{message}</em> : null
                  }
                />
              </div>
            </InputWrapper>

            <InputWrapper className="button">
              <button
                type="submit"
                style={{ width: "100%" }}
                onClick={() => {
                  handleSubmit2(onSubmit2, onError2);
                }}
              >
                비밀번호 변경
              </button>
            </InputWrapper>
          </form>
        ) : (
          <form action="" onSubmit={handleSubmit1(onSubmit1, onError1)}>
            <InputWrapper className="input-wrapper">
              <div>
                <span>아이디</span>
                <input
                  type="text"
                  placeholder="OLIVE SHOP 아이디"
                  {...register1("id", {
                    required: "아이디를 입력하세요.",
                    minLength: {
                      value: 5,
                      message: "아이디는 5자리 이상이어야 합니다.",
                    },
                  })}
                />
                <ErrorMessage
                  errors={errors1}
                  name="id"
                  render={({ message }) =>
                    touchedFields1.id ? <em>{message}</em> : null
                  }
                />
              </div>
              <div>
                <span>이름</span>
                <input
                  type="text"
                  placeholder="이름을 입력해주세요"
                  {...register1("name", { required: "이름을 입력하세요." })}
                />
                <ErrorMessage
                  errors={errors1}
                  name="name"
                  render={({ message }) =>
                    touchedFields1.name ? <em>{message}</em> : null
                  }
                />
              </div>
              <div>
                <span>이메일</span>
                <input
                  type="text"
                  placeholder="이메일을 입력해주세요."
                  {...register1("email", {
                    required: "이메일을 입력하세요.",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "이메일 주소를 확인하세요.",
                    },
                  })}
                />
                <ErrorMessage
                  errors={errors1}
                  name="email"
                  render={({ message }) =>
                    touchedFields1.email ? <em>{message}</em> : null
                  }
                />
              </div>
              <div>
                <span>생년월일</span>
                <input
                  type="text"
                  placeholder="법정생년월일 6자리를 입력해주세요."
                  maxLength={6}
                  {...register1("birthDy", {
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
                    setValue1("birthDy", filteredValue); // 필터링한 값으로 업데이트
                  }}
                />
                <ErrorMessage
                  errors={errors1}
                  name="birthDy"
                  render={({ message }) =>
                    touchedFields1.birthDy ? <em>{message}</em> : null
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
                    {...register1("phoneNumber", {
                      required: "핸드폰번호를 입력하세요.",
                      minLength: {
                        value: 11,
                        message: "핸드폰번호를 11자리를 입력하세요.",
                      },
                    })}
                    onChange={(e) => {
                      const filteredValue = numberOnly(e.target.value);
                      setValue1("phoneNumber", filteredValue); // 필터링한 값으로 업데이트
                      setChecked({ phone: false, code: false });
                    }}
                  />
                  <button
                    type="button"
                    className={`${checked.phone && "action"}`}
                    onClick={() => {
                      if (getValues1("phoneNumber").length !== 11) {
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
                  errors={errors1}
                  name="phoneNumber"
                  render={({ message }) =>
                    touchedFields1.phoneNumber ? <em>{message}</em> : null
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
                    {...register1("code", {
                      required: "인증번호를 입력하세요.",
                      minLength: {
                        value: 6,
                        message: "인증번호를 6자리를 입력하세요.",
                      },
                    })}
                    onChange={(e) => {
                      const filteredValue = numberOnly(e.target.value);
                      setValue1("code", filteredValue); // 필터링한 값으로 업데이트
                    }}
                  />
                  <button
                    type="button"
                    className={`${checked.code && "action"}`}
                    onClick={() => {
                      // reset1();
                      if (!checked.phone) {
                        alert("인증번호 전송을 해주세요");
                        return;
                      }
                      if (getValues1("code").length !== 6) {
                        alert("인증번호를 확인해주세요");
                        return;
                      }
                      verifyCode(getValues1("code"));
                      stopTimer();
                    }}
                  >
                    인증번호 확인
                  </button>
                </Buttom>
                <ErrorMessage
                  errors={errors1}
                  name="code"
                  render={({ message }) =>
                    touchedFields1.code ? <em>{message}</em> : null
                  }
                />
              </div>
            </InputWrapper>

            <InputWrapper className="button">
              <button
                type="button"
                onClick={() => {
                  reset1();
                }}
              >
                초기화
              </button>
              <button
                type="submit"
                onClick={() => {
                  handleSubmit1(onSubmit1, onError1);
                }}
              >
                비밀번호 변경
              </button>
            </InputWrapper>
          </form>
        )}
      </Container>
    </Center>
  );
};

export default FindPassword;
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
