import React, { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import type { RootState } from "../../redex/store";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../supabase";
import {
  isEmptyObject,
  isToday,
  defaultProfile,
  getUserInfo,
} from "../../bin/common";
import moment from "moment";
import {
  PaymentType,
  ReviewType,
  type OrderType,
  type StringType,
  type UserInfoType,
} from "../../compontents/card/card.type";
import ModalContainer from "../../compontents/ModalContainer";
import {
  BlueButton,
  InputBox,
  Textarea,
  WhiteButton,
} from "../../../public/assets/style";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
interface OrderDataType {
  [key: string]: OrderType[];
}

const Mypage = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const userToken = useSelector((state: RootState) => state?.user.token);
  const userInfo = useSelector((state: RootState) => state?.userInfo);
  const [orderData, setOrderData] = useState<OrderDataType>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [openedMyInfo, setOpenedMyInfo] = useState<boolean>(false);
  const [reviewPossibleData, setReviewPossibleData] = useState<PaymentType[]>(
    []
  );
  const [myReview, setMyReview] = useState<ReviewType[]>([]);
  const [myInfoData, setMyInfoData] = useState<StringType>({});

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMyInfoData((prevState) => ({
        ...prevState,
        profileImg: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDataLoad = useCallback(
    async (token: string) => {
      const { data: paymentData, error: cartError } = await supabase
        .from("payment")
        .select("*")
        .eq("userId", token)
        .gte(
          "created_at",
          moment
            .utc(isToday)
            .add(9, "hours")
            .subtract(1, "months")
            .toISOString()
        ) // 한달 전 >=
        .lte("created_at", moment.utc(isToday).add(9, "hours").toISOString()); // 오늘 날짜 <=

      paymentData?.map((item) => {
        setOrderData((prevState) => ({
          ...prevState,
          [item.deliveryStep]: [...prevState[item.deliveryStep], item],
        }));
      });

      // 리뷰 작성 가능한 데이터 (배송 완료)
      const { data: reviewData, error: reviewError } = await supabase
        .from("payment")
        .select("*")
        .eq("userId", token)
        .eq("deliveryStep", 5)
        .gte(
          "delivered_at",
          moment.utc(isToday).subtract(3, "months").toISOString()
        ) // 한달 전 >=
        .lte("delivered_at", moment.utc(isToday).toISOString()); // 오늘 날짜 <=

      setReviewPossibleData(reviewData || []);

      // 리뷰 작성 완료
      const { data: myReviewData, error: myReviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("userId", token)
        .order("created_at", { ascending: false });
      setMyReview(myReviewData || []);

      // 프로필 변경 데이터 넣기
      if (isEmptyObject(userInfo)) return;
      const info = {
        ...userInfo,
        nickNameCheck: false,
      };
      setMyInfoData(info);
    },
    [userToken, userInfo]
  );
  useEffect(() => {
    //console.log(userInfo);
    handleDataLoad(userToken);
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
    handleDataLoad(userToken);
    setOpenedMyInfo(false);
  };

  const handleNickNameCheck = async (data: UserInfoType) => {
    if (!data?.nickName) {
      alert("닉네임을 입력해주세요");
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
    } catch (error) {}
  };
  return (
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
                <img src={userInfo.profileImg || defaultProfile} alt="프로필" />
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
      {/* 주문/배송 조회 */}
      <OrderBox>
        <div className="text-box">
          <div>
            <h2>주문/배송 조회</h2>
            <em>(최근 1개월)</em>
          </div>
          <span>더보기 &gt;</span>
        </div>
        <ul className="order-box">
          <li>
            <em className={`${orderData[1]?.length > 0 && "on"}`}>
              {orderData[1]?.length}
            </em>
            <span>주문접수</span>
          </li>
          <li>
            <em className={`${orderData[2]?.length > 0 && "on"}`}>
              {orderData[2]?.length}
            </em>
            <span>결제완료</span>
          </li>
          <li>
            <em className={`${orderData[3]?.length > 0 && "on"}`}>
              {orderData[3]?.length}
            </em>
            <span>배송준비중</span>
          </li>
          <li>
            <em className={`${orderData[4]?.length > 0 && "on"}`}>
              {orderData[4]?.length}
            </em>
            <span>배송중</span>
          </li>
          <li>
            <em className={`${orderData[5]?.length > 0 && "on"}`}>
              {orderData[5]?.length}
            </em>
            <span>베송완료</span>
          </li>
        </ul>
      </OrderBox>
      {/* 리뷰 */}
      <OrderBox>
        <div className="text-box">
          <div>
            <h2>리뷰 조회</h2>
          </div>
          <span>더보기 &gt;</span>
        </div>
        <ul className="review-box">
          <li>
            <em>{reviewPossibleData?.length}</em>
            <span>작성 가능</span>
          </li>
          <li>
            <em>{myReview?.length}</em>
            <span>나의 리뷰</span>
          </li>
        </ul>
      </OrderBox>

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
        <ModalMyInfo style={{ marginTop: "1rem" }}>
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
                      fileInputRef.current.click();
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
    </Container>
  );
};
const ModalMyInfo = styled.div`
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

const OrderBox = styled.div`
  margin-top: 60px;
  .text-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      display: flex;
      align-items: baseline;
      column-gap: 10px;
      em {
        font-size: 12px;
      }
    }
    span {
      font-size: 14px;
      cursor: pointer;
    }
  }
  li {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    em {
      color: #888;
      font-style: normal;
      font-size: 40px;
      font-weight: 500;
      &.on {
        color: ${({ theme }) => theme.color.main};
      }
    }
    span {
      color: #666;
      font-size: 16px;
    }
    &::after {
      display: block;
      content: ">";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 0;
      color: #888;
      font-size: 40px;
      font-weight: bold;
    }
    &:last-child::after {
      display: none;
    }
  }

  .order-box {
    overflow: hidden;
    width: 100%;
    margin-top: 20px;
    border-radius: 10px;
    background-color: #f5f5f5;
    height: 117px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
  .review-box {
    overflow: hidden;
    width: 100%;
    margin-top: 20px;
    /* height: 117px; */
    display: grid;
    column-gap: 50px;
    grid-template-columns: repeat(2, 1fr);
    li {
      height: 117px;
      cursor: pointer;
      border-radius: 10px;
      flex-direction: row-reverse;
      column-gap: 10px;
      background-color: #f5f5f5;
      &::after {
        display: none;
      }
      em {
        color: ${({ theme }) => theme.color.main};
      }
    }
    li::after {
    }
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
export default Mypage;
