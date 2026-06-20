import { useEffect } from "react";
import { Center } from "@/components/ui/Center";
import { Container, InputWrapper } from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";
import { useForm, FieldErrors } from "react-hook-form";
import { db } from "../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useCookies } from "react-cookie";
import { add } from "../redux/reducers/userReducer";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { handleCartItems, getUserInfo } from "../utils/common";
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
            setCookie("token", token, { maxAge: 1 * 24 * 60 * 60 });
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
      const usersRef = collection(db, "users");
      const id = query(usersRef, where("id", "==", data.id));

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

    const fieldError = errors[firstError];

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
      <Container
        className="min-h-[570px]"
        style={{ height: "calc(100vh - 311px)" }}
      >
        <h1>로그인</h1>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          role="form"
          aria-label="로그인 폼"
        >
          <InputWrapper className="!gap-2.5">
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
          <div className="mt-[25px] flex flex-col gap-2.5">
            <div className="flex flex-row items-center">
              <LoadCanvasTemplateNoReload
                reloadColor="red"
                reloadText="reload"
              />
              <span
                className="h-10 w-10 cursor-pointer text-center text-[30px] leading-10"
                onClick={() => loadCaptchaAgain()}
              >
                &#x21bb;
              </span>
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
          </div>
          <div className="my-[15px] mb-[30px] flex w-[400px] items-center justify-between">
            <label className="flex items-center text-sm text-text-sub">
              <input
                type="checkbox"
                placeholder="아이디 저장"
                className="mr-[5px]"
                {...register("saveId")}
                onChange={(event) => {
                  setValue("saveId", event.target.checked);
                }}
              />
              아이디 저장
            </label>
            <div>
              <span
                className="relative ml-[15px] block cursor-pointer text-xs text-text-sub after:absolute after:-right-2 after:top-0 after:content-['_|_'] last:after:hidden"
                onClick={() => {
                  navigate("/member/find-id");
                }}
              >
                아이디 찾기
              </span>
              <span
                className="relative ml-[15px] block cursor-pointer text-xs text-text-sub"
                onClick={() => {
                  navigate("/member/find-password");
                }}
              >
                비밀번호 변경
              </span>
            </div>
          </div>

          <InputWrapper className="!gap-2.5">
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
        </form>
      </Container>
    </Center>
  );
};

export default Login;
