import React, { useEffect, type ReactNode } from "react";
import ReactModal from "react-modal";
import Modal from "react-modal";
import styled from "@emotion/styled";
import { useWindowSize } from "@uidotdev/usehooks";
interface ModalContainerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  overlayStyle?: ReactModal.Styles;
  heightCheck?: string;
  widthCheck?: string;
  style?: ReactModal.Styles;
  header?: string | ReactNode;
  buttons?: string | ReactNode;
  handleOk?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  closeModal?: () => void;
  footerText?: string | null;
  okText?: string | null;
  noCloseModal?: boolean | null;
  formRef?: React.RefObject<HTMLInputElement | HTMLFormElement | null>;
}

const customStyles: ReactModal.Styles = {
  overlay: {
    zIndex: "9999",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    position: "relative",
    // marginTop: '50px',
    maxWidth: "90%",
    width: "60%",
    height: "fit-content",
    // overflowY: "hidden",
    maxHeight: "90%",
    borderRadius: "6px",
    padding: 0,
    inset: 0,
  },
};
const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  isOpen,
  onClose,
  overlayStyle,
  widthCheck,
  header,
  style,
  handleOk,
  buttons,
  footerText = null,
  closeModal,
  formRef,
  okText = "취소",
  noCloseModal,
}) => {
  const { width } = useWindowSize();

  // 팝업시 스크롤 제거,생성
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      onRequestClose={() => onClose()}
      style={{
        overlay: {
          ...customStyles.overlay,
          ...overlayStyle,
        },
        content: {
          ...customStyles.content,
          width: widthCheck,
          // height: heightCheck,
          ...style,
          // ...((width ?? 0) < 992
          //   ? {
          //       marginTop: 0,
          //       width: "100%",
          //       maxWidth: "100%",
          //       height: "100%",
          //       maxHeight: "100%",
          //     }
          //   : {}),
        },
      }}
      shouldCloseOnOverlayClick={false}
    >
      <Padding>
        <Header>
          {(width ?? 0) < 992 ? (
            <>
              <div>
                <SidebarButton
                  onClick={() => onClose()}
                  alt="bars"
                  src="/assets/icons/chevron-left.svg"
                />
              </div>
              <div>
                {typeof header === "string" ? (
                  <h4 style={{ color: "#171923", fontSize: "18px", margin: 0 }}>
                    {header}
                  </h4>
                ) : (
                  header
                )}
              </div>
              <div></div>
            </>
          ) : (
            <>
              <div>
                {typeof header === "string" ? (
                  <h4 style={{ color: "#171923", fontSize: "18px", margin: 0 }}>
                    {header}
                  </h4>
                ) : (
                  header
                )}
              </div>

              <div></div>

              <ButtonGroup>
                {buttons}
                <ModalButton onClick={() => onClose()}>
                  <img
                    alt={"XButton"}
                    src="/public/assets/images/icons/left-icon.svg"
                  />
                </ModalButton>
              </ButtonGroup>
            </>
          )}
        </Header>

        <Content className={handleOk === undefined ? "remove_scrollbar" : ""}>
          {children}
        </Content>
        <Footer className={"footer"}>
          {footerText ? <div>{footerText}</div> : <div></div>}
          <ButtonGroup>
            <ModalButton
              type="submit"
              style={{ color: "#fff", background: "#3279F5" }}
              onClick={(event) => {
                if (formRef?.current) {
                  formRef?.current.requestSubmit();
                  if (noCloseModal !== true) closeModal?.();
                  return;
                }
                handleOk?.(event);
                if (noCloseModal !== true) closeModal?.();
              }}
            >
              {okText}
            </ModalButton>
          </ButtonGroup>
        </Footer>
      </Padding>
    </Modal>
  );
};
export const ModalButton = styled.button`
  display: flex;
  height: 36px;
  padding: 6px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  background: #edf2f7;
  cursor: pointer;
  color: #1a202c;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  margin-left: 17px;
  white-space: nowrap;
  width: auto;
  border: none; /* 기존 div에는 border가 없으므로 추가 */
  outline: none; /* 포커스 효과 제거 */

  &:hover {
    background: #e2e8f0;
  }

  img {
    width: 14px;
  }
`;

const Padding = styled.div`
  display: flex;
  flex-direction: column;
  /* height: calc(100% - 62px - 62px); */
  padding: 0px 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 2px solid #000;
  & > div {
    width: 33.3%;

    &:nth-of-type(2) {
      //&:nth-child(2) {
      text-align: center;
    }
  }

  h4 {
    white-space: nowrap;
  }
`;

const Content = styled.div`
  height: 100%;
  /* overflow-y: auto; */
  /* padding: 15px 0; */
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  /* padding: 16px 24px; */
`;

const SidebarButton = styled.img`
  cursor: pointer;
`;
export default ModalContainer;
