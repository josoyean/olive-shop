import { useEffect, useState } from "react";
import { Center } from "@/components/ui/Center";
import { Container, InputWrapper } from "@/components/ui/FormElements";
import { useForm, FieldErrors } from "react-hook-form";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
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

const DEMO_ACCOUNT = {
  id: "sykor1016",
  password: "@uw7905vf@",
} as const;

const Login = () => {
  const [, setCookie] = useCookies(["token"]);
  const user = useSelector((state: RootState) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { register, handleSubmit, setFocus, setValue } = useForm<DataType>({
    defaultValues: { saveId: user.saveId },
  });

  const handleSignin = async (email: string, data: DataType) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        data.password
      );
      const token = userCredential.user.uid;

      await getUserInfo(token, dispatch);
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
    } catch (error) {
      console.error(error);
      alert("일치한 회원정보가 없습니다.");
    }
  };

  const loginWithCredentials = async (
    data: Pick<DataType, "id" | "password" | "saveId">
  ) => {
    const usersRef = collection(db, "users");
    const idQuery = query(usersRef, where("id", "==", data.id));
    const idSnapshot = await getDocs(idQuery);

    if (idSnapshot.empty) {
      alert("일치한 회원정보가 없습니다.");
      return;
    }

    const email = idSnapshot.docs[0].data().email as string;
    await handleSignin(email, {
      ...data,
      captcha: "",
    });
  };

  const performLogin = async (
    data: Pick<DataType, "id" | "password" | "saveId" | "captcha">,
    options?: { skipCaptcha?: boolean }
  ) => {
    if (!options?.skipCaptcha && !validateCaptcha(data.captcha)) {
      alert("자동입력 방지문자를 확인해주세요.");
      setValue("captcha", "");
      return;
    }

    await loginWithCredentials(data);
  };

  const onSubmit = async (data: DataType) => {
    try {
      await performLogin(data);
    } catch (error) {
      console.error(error);
      alert("로그인 요청에 실패했습니다. Firebase 설정을 확인해주세요.");
    }
  };

  const handleDemoLogin = async () => {
    setValue("id", DEMO_ACCOUNT.id);
    setValue("password", DEMO_ACCOUNT.password);

    setIsDemoLoading(true);
    try {
      // 데모 로그인은 captcha(react-simple-captcha) 검증을 건너뜁니다.
      await performLogin(
        {
          id: DEMO_ACCOUNT.id,
          password: DEMO_ACCOUNT.password,
          saveId: false,
          captcha: "",
        },
        { skipCaptcha: true }
      );
    } catch (error) {
      console.error(error);
      alert("데모 로그인에 실패했습니다. Firebase 설정을 확인해주세요.");
    } finally {
      setIsDemoLoading(false);
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
          <div className="mb-6 w-[400px] rounded-md border border-[#c5e08a] bg-[#f7fbee] px-4 py-3.5 text-left [&_button.demo-login-btn]:!w-full">
            <p className="mb-2 text-sm font-semibold text-text-main">
              💡 포트폴리오 확인용 계정
            </p>
            <p className="text-xs leading-5 text-text-sub">
              ID : {DEMO_ACCOUNT.id}
              <br />
              PW : {DEMO_ACCOUNT.password}
            </p>
            <p className="mt-2 text-xs leading-5 text-text-sub">
              ※ 회원가입 없이 바로 테스트하실 수 있도록 데모 계정을 제공합니다.
            </p>
            <button
              type="button"
              disabled={isDemoLoading}
              className="demo-login-btn mt-3 !h-10 !w-full !border-primary !bg-white !text-sm !font-semibold !text-primary disabled:!opacity-60"
              onClick={handleDemoLogin}
            >
              {isDemoLoading ? "로그인 중..." : "데모 계정으로 로그인"}
            </button>
          </div>

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
                required: "비밀번호를 입력하세요.",
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
            <div className="flex flex-row items-center">
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

          <InputWrapper className="gap-2.5">
            <button type="submit" className="w-full">
              로그인
            </button>
            <button
              type="button"
              className="w-full"
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
