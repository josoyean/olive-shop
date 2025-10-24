import { useEffect, useState, useCallback, useRef } from "react";
import { Center } from "../../../public/assets/style";
import Nav from "./nav";
import { useSearchParams } from "react-router-dom";
import type { RootState } from "../../redex/store";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import Mypage from "./mypage";
import { isEmptyObject, defaultProfile, getUserInfo } from "../../bin/common";
import ModalContainer from "../../compontents/ModalContainer";
import { InputBox, Textarea, WhiteButton } from "../../../public/assets/style";
import type { UserInfoType } from "compontents/card/card.type";
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
    <div>
      <Center style={{ display: "flex" }}>
        <Nav></Nav>
        <Container>
          {/* 나의 프로필 */}
          <InfoUser>
            <div className="top-box">
              <em>
                {`${userInfo?.name?.slice(0, 1)}*${userInfo?.name?.slice(
                  userInfo?.name?.length - 1,
                  userInfo?.name?.length
                )}`}
                님 반갑습니다.
              </em>
              <span
                onClick={(event) => {
                  event.preventDefault();
                  setOpenedMyInfo(true);
                }}
              >
                나의 프로필 변경 &gt;
              </span>
            </div>
            <div className="bottom-box">
              <ul>
                <li>
                  <span>프로필 사진</span>
                  <em>
                    <img
                      src={userInfo.profileImg || defaultProfile}
                      alt="프로필"
                    />
                  </em>
                </li>
                <li>
                  <span>닉네임</span>
                  <em>{userInfo?.nickName || "저장된 닉네임이 없습니다."}</em>
                </li>
                <li>
                  <span>소개</span>
                  <em
                    dangerouslySetInnerHTML={{
                      __html: userInfo?.infoText || "저장된 소개가 없습니다.",
                    }}
                  ></em>
                </li>
              </ul>
            </div>
          </InfoUser>
          {pageType === "마이페이지" && <Mypage></Mypage>}
          {pageType === "주문배송" && <StoreOrderDelivery></StoreOrderDelivery>}
          {pageType === "리뷰조회" && <MypageReviews></MypageReviews>}
        </Container>
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
        <ModalMyInfo>
          <ul>
            <li>
              <em>프로필 이미지</em>
              <div className="profile">
                <img
                  src={myInfoData.profileImg || defaultProfile}
                  alt="프로필 미리보기"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div className="review-preview-img__btns">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  <span
                    className="thumbnailFile"
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
                    className="thumbnailClearBtn"
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
            <li style={{ marginTop: "20px" }}>
              <em>닉네임</em>
              <div className="nickname">
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
                  width="fit-content"
                  height="35px"
                  style={{ padding: "0 5px" }}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNickNameCheck(myInfoData);
                  }}
                  className={`${myInfoData?.nickNameCheck ? "check" : ""}`}
                >
                  중복 확인
                </WhiteButton>
                <em className="info">이름보다는 별명을 적어주세요</em>
              </div>
            </li>
            <li style={{ marginTop: "50px" }}>
              <em>소개</em>
              <div className="information">
                <Textarea
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
                <em className="info">개인정보를 남기지 않게 조심해 주세요</em>
                <span>{myInfoData?.infoText?.length || 0} / 100</span>
              </div>
            </li>
          </ul>
        </ModalMyInfo>
      </ModalContainer>
    </div>
  );
};
const ModalMyInfo = styled.div`
  padding: 20px 0;
  li {
    display: flex;
    > em {
      font-size: 14px;
      width: 117px;
      display: block;
      font-weight: 400;
      color: #131518;
    }
    > div {
      width: calc(100% - 117px);
    }
  }
  .profile {
    /* width: auto; */
    display: flex;
    flex-direction: column;

    // 프로필 사진
    > img {
      border: 1px solid #dadde0;
    }
    .review-preview-img__btns {
      margin-top: -25px;
      background-color: #fff;
      display: flex;
      border: 1px solid #dadde0;
      border-radius: 40px;
      column-gap: 10px;
      width: fit-content;
      padding: 4px 10px;
      margin-left: 13px;
      align-items: center;
      span {
        width: 23px;
        height: 23px;
        display: block;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .nickname {
    /* width: fit-content; */
    display: flex;
    column-gap: 20px;
    position: relative;
    .check {
      color: #808080;
      border: 1px solid #808080;
      background-color: #dadde0;
    }
  }
  .information {
    position: relative;
    > span {
      position: absolute;
      font-size: 10px;
      font-weight: 300px;
      color: #808080;
      right: 0;
      bottom: -17px;
    }
  }
  em.info {
    position: absolute;
    font-size: 10px;
    font-weight: 300px;
    color: #a7a7a7;
    left: 0;
    bottom: -17px;
  }
`;
const InfoUser = styled.div`
  width: 100%;
  .top-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 9px 20px;
    background-color: black;

    > em {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    > span {
      cursor: pointer;
      color: #fff;
      font-size: 13px;
    }
  }
  .bottom-box {
    padding: 13px 20px;
    border: 1px solid #ccc;
    li {
      display: flex;
      margin-bottom: 10px;
      column-gap: 15px;
      span {
        display: block;
        width: 70px;
        font-size: 13px;
      }
      em {
        font-size: 12px;
        color: #797979;
      }
      img {
        width: 60px;
        border: 1px solid ${({ theme }) => theme.lineColor.main};
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
      }
      &:last-child {
        margin-bottom: 0px;
      }
    }
  }
`;
const Container = styled.div`
  padding: 30px;
  width: calc(100% - 170px);
  min-height: calc(100vh - 177.5px);
`;
export default StoreMypage;
