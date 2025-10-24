import { useEffect } from "react";
import { Center, Container } from "../../public/assets/style";
import styled from "styled-components";
import { useForm, FieldErrors } from "react-hook-form";
import { db } from "../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redex/store";
import { useCookies } from "react-cookie";
import { add } from "../redex/reducers/userReducer";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { handleCartItems, getUserInfo } from "../bin/common";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplateNoReload,
  validateCaptcha,
} from "react-simple-captcha";

interface DataType {
  id: string;
  password: string;
  saveId: boolean;
  captcha: string;
}
const Login = () => {
  const [, setCookie] = useCookies(["token"]);
  const auth = getAuth();
  const user = useSelector((state: RootState) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, setFocus, setValue } = useForm<DataType>({
    defaultValues: { saveId: user.saveId },
  });

  const handleSignin = async (email: string, data: DataType) => {
    await signInWithEmailAndPassword(auth, email, data.password)
      .then((userCredential) => {
        const token = userCredential.user.uid;

        getUserInfo(token, dispatch)
          .then(() => {
            dispatch(
              add({
                token: token,
                saveId: data.saveId,
                ...(data.saveId ? { userId: data.id } : {}),
              })
            );
            setCookie("token", token, { maxAge: 1 * 24 * 60 * 60 }); // 1일
            handleCartItems(token, dispatch, false);
            navigate(-1);
          })
          .catch((error) => {
            console.log(error);
            return;
          });
      })
      .catch((error) => {
        console.log(error);
        alert("일치한 회원정보가 없습니다.");
        return;
      });
  };

  const onSubmit = async (data: DataType) => {
    if (!validateCaptcha(data.captcha)) {
      alert("자동입력 방지문자를 확인해주세요.");
      setValue("captcha", "");
      return;
    }

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
    const fieldsOrder: (keyof DataType)[] = [
      "id",
      "password",
      "saveId",
      "captcha",
    ];
    if (errorKeys.length === 0) return;

    const firstError = fieldsOrder.find((key) => errorKeys.includes(key));
    if (!firstError) return;

    const fieldError = errors[firstError]; // FieldError | undefined

    if (!fieldError) return;

    if (fieldError.type === "noSpaces") {
      setValue(firstError, "");
    }

    setFocus(firstError);
    alert(fieldError.message || "Form validation error");
  };
  useEffect(() => {
    setValue("saveId", user.saveId);
    if (user.saveId) {
      setValue("id", user.userId || "");
    }

    loadCaptchaEnginge(6);
  }, []);

  const loadCaptchaAgain = () => {
    loadCaptchaEnginge(6);
  };

  return (
    <Center>
      <Container style={{ height: "calc(100vh - 311px)", minHeight: "570px" }}>
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
          <CaptchaWrapper>
            <div>
              <LoadCanvasTemplateNoReload
                reloadColor="red"
                reloadText="reload"
              />
              <span onClick={() => loadCaptchaAgain()}>&#x21bb;</span>
            </div>
            <input
              type="text"
              placeholder="자동입력 방지문자를 입력해 주세요"
              {...register("captcha", {
                required: "자동입력 방지문자를 입력하세요.",
              })}
              onChange={(event) => {
                setValue("captcha", event.target.value);
              }}
              maxLength={6}
            />
          </CaptchaWrapper>
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
const CaptchaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  row-gap: 10px;
  > div {
    display: flex;
    flex-direction: row;
    align-items: center;

    canvas {
      width: 350px;
      height: 40px;
    }
    span {
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 30px;
      text-align: center;
      line-height: 40px;
    }
  }
`;
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
