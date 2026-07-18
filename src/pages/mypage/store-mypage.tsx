import { useEffect, useState, useCallback, useRef } from "react";
import { Center } from "@/components/ui/Center";
import {
  InputBox,
  TextareaField,
  WhiteButton,
} from "@/components/ui/FormElements";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";
import Nav from "./nav";
import { useSearchParams } from "react-router-dom";
import type { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import Mypage from "./mypage";
import { isEmptyObject, defaultProfile, getUserInfo } from "../../utils/common";
import ModalContainer from "../../components/ModalContainer";
import type { UserInfoType } from "components/card/card.type";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import StoreOrderDelivery from "./store-order-delivery";
import MypageReviews from "../../pages/review/mypage-reviews";
const StoreMypage = () => {
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get("t_page");
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userInfo = useSelector((state: RootState) => state?.userInfo);
  const userToken = useSelector((state: RootState) => state?.user.token);
  const [openedMyInfo, setOpenedMyInfo] = useState<boolean>(false);
  const [myInfoData, setMyInfoData] = useState<UserInfoType>({});
  const handleDataLoad = useCallback(async () => {
    // 프로필 변경 데이터 넣기
    if (isEmptyObject(userInfo)) return;
    const info = {
      ...userInfo,
      nickNameCheck: false,
    };
    setMyInfoData(info);
  }, [userToken, userInfo]);
  useEffect(() => {
    handleDataLoad();
  }, [handleDataLoad]);

  const handleChangeProfile = async (data: UserInfoType) => {
    // 닉네임 수정되면 중복 확인 체크 확인
    if (data?.nickName !== "" && data?.nickName !== userInfo?.nickName) {
      if (!data?.nickNameCheck) {
        alert("닉네임을 중복 확인해주세요");
        return;
      }
    }

    // 프로필 변경 후 메인 화면 보여주기
    await updateDoc(doc(db, "users", userToken), {
      nickName: data.nickName || "",
      profileImg: data.profileImg || "",
      infoText: data.infoText || "",
    });
    getUserInfo(userToken, dispatch);
    handleDataLoad();
    setOpenedMyInfo(false);
  };

  const handleNickNameCheck = async (data: UserInfoType) => {
    if (!data?.nickName) {
      alert("닉네임을 입력해주세요");
      return;
    }
    if (myInfoData?.nickName === data?.nickName) {
      alert("닉네임을 변경해주세요");
      return;
    }

    try {
      const usersRef = collection(db, "users"); // users 컬렉션 참조
      const nickName = query(usersRef, where("nickName", "==", data.nickName)); // 특정 이메일 찾기

      // 특정 이메일 찾기
      const nickNameSnapshot = await getDocs(nickName);
      if (!nickNameSnapshot.empty) {
        alert("중복된 닉네임 입니다. 다시 입력해주세요");
        return;
      } else {
        setMyInfoData((prevState) => ({
          ...prevState,
          nickNameCheck: true,
        }));
        alert("사용이 가능한 닉네임 입니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMyInfoData(
        (prevState: UserInfoType) =>
          ({
            ...prevState,
            profileImg: reader.result,
          } as UserInfoType)
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div role="main">
      <Center className="flex">
        <Nav></Nav>
        <div className="min-h-[calc(100vh-177.5px)] w-[calc(100%-170px)] p-[30px]">
          <div className="w-full" role="region" aria-label="User Profile">
            <div className="top-box flex flex-row items-center justify-between bg-black px-5 py-[9px]" role="group">
              <em className="text-base font-semibold text-white" role="heading" aria-level={2}>
                {`${userInfo?.name?.slice(0, 1)}*${userInfo?.name?.slice(
                  userInfo?.name?.length - 1,
                  userInfo?.name?.length
                )}`}
                님 반갑습니다.
              </em>
              <span
                role="button"
                className="cursor-pointer text-[13px] text-white"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenedMyInfo(true);
                }}
              >
                <span className="inline-flex items-center gap-0.5">
                  나의 프로필 변경
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </span>
              </span>
            </div>
            <div className="bottom-box border border-[#ccc] px-5 py-[13px]" role="group">
              <ul role="list">
                <li className="mb-2.5 flex gap-[15px] last:mb-0" role="listitem">
                  <span className="block w-[70px] text-[13px]">프로필 사진</span>
                  <em className="text-xs text-[#797979]">
                    <img
                      role="img"
                      className="h-[60px] w-[60px] overflow-hidden rounded-full border border-line-main"
                      src={userInfo.profileImg || defaultProfile}
                      alt="프로필"
                    />
                  </em>
                </li>
                <li className="mb-2.5 flex gap-[15px] last:mb-0" role="listitem">
                  <span className="block w-[70px] text-[13px]">닉네임</span>
                  <em className="text-xs text-[#797979]">{userInfo?.nickName || "저장된 닉네임이 없습니다."}</em>
                </li>
                <li className="mb-2.5 flex gap-[15px] last:mb-0" role="listitem">
                  <span className="block w-[70px] text-[13px]">소개</span>
                  <em
                    className="text-xs text-[#797979]"
                    dangerouslySetInnerHTML={{
                      __html: userInfo?.infoText || "저장된 소개가 없습니다.",
                    }}
                  ></em>
                </li>
              </ul>
            </div>
          </div>
          {pageType === "마이페이지" && <Mypage></Mypage>}
          {pageType === "주문배송" && <StoreOrderDelivery></StoreOrderDelivery>}
          {pageType === "리뷰조회" && <MypageReviews></MypageReviews>}
        </div>
      </Center>

      <ModalContainer
        // isOpen={true}
        isOpen={openedMyInfo}
        onClose={() => setOpenedMyInfo(false)}
        widthCheck={"550px"}
        header="프로필 변경"
        okText="저장"
        heightCheck="600px"
        handleOk={() => {
          handleChangeProfile(myInfoData);
        }}
      >
        <div className="py-5" role="form" aria-label="Profile Edit Form">
          <ul role="list">
            <li className="flex" role="listitem">
              <em className="block w-[117px] text-sm font-normal text-text-main">프로필 이미지</em>
              <div className="profile flex w-[calc(100%-117px)] flex-col" role="group">
                <img
                  role="img"
                  className="border border-[#dadde0]"
                  src={myInfoData.profileImg || defaultProfile}
                  alt="프로필 미리보기"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div className="review-preview-img__btns -mt-[25px] ml-[13px] flex w-fit items-center gap-2.5 rounded-[40px] border border-[#dadde0] bg-white px-2.5 py-1" role="group">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  <span
                    role="button"
                    className="thumbnailFile block h-[23px] w-[23px] [&_img]:h-full [&_img]:w-full"
                    onClick={(event) => {
                      event.preventDefault();
                      fileInputRef?.current?.click();
                    }}
                  >
                    <img
                      src="/public/assets/images/icons/ico_preivew_camera.png"
                      alt="업로드 버튼 이미지"
                    />
                  </span>
                  <span
                    role="button"
                    className="thumbnailClearBtn block h-[23px] w-[23px] [&_img]:h-full [&_img]:w-full"
                    onClick={(event) => {
                      event.preventDefault();
                      setMyInfoData((prevState) => ({
                        ...prevState,
                        profileImg: null,
                      }));
                    }}
                  >
                    <img
                      src="/public/assets/images/icons/ico_preview_cancel.png"
                      alt="삭제 버튼 이미지"
                    />
                  </span>
                </div>
              </div>
            </li>
            <li className="mt-5 flex" role="listitem">
              <em className="block w-[117px] text-sm font-normal text-text-main">닉네임</em>
              <div className="nickname relative flex w-[calc(100%-117px)] gap-5" role="group">
                <InputBox
                  width="100%"
                  height="35px"
                  value={myInfoData?.nickName}
                  onChange={(event) => {
                    setMyInfoData((prevState) => ({
                      ...prevState,
                      nickName: event.target.value,
                      nickNameCheck: false,
                    }));
                  }}
                  placeholder="닉네임을 설정해 주세요"
                />
                <WhiteButton
                  role="button"
                  width="fit-content"
                  height="35px"
                  style={{ padding: "0 5px" }}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNickNameCheck(myInfoData);
                  }}
                  className={cn(myInfoData?.nickNameCheck && "check !border-[#808080] !bg-[#dadde0] !text-[#808080]")}
                >
                  중복 확인
                </WhiteButton>
                <em className="info absolute bottom-[-17px] left-0 text-[10px] text-[#a7a7a7]">이름보다는 별명을 적어주세요</em>
              </div>
            </li>
            <li className="mt-[50px] flex" role="listitem">
              <em className="block w-[117px] text-sm font-normal text-text-main">소개</em>
              <div className="information relative w-[calc(100%-117px)]" role="group">
                <TextareaField
                  width="100%"
                  maxLength={100}
                  value={myInfoData?.infoText}
                  placeholder="소개 글을 적어주세요 (공백제외, 특수문자포함)"
                  onChange={(event) => {
                    setMyInfoData((prevState) => ({
                      ...prevState,
                      infoText: event.target.value,
                    }));
                  }}
                />
                <em className="info absolute bottom-[-17px] left-0 text-[10px] text-[#a7a7a7]">개인정보를 남기지 않게 조심해 주세요</em>
                <span className="absolute bottom-[-17px] right-0 text-[10px] font-light text-[#808080]">{myInfoData?.infoText?.length || 0} / 100</span>
              </div>
            </li>
          </ul>
        </div>
      </ModalContainer>
    </div>
  );
};
export default StoreMypage;
