import React, { useEffect, type ReactNode } from "react";
import ReactModal from "react-modal";
import Modal from "react-modal";
import { useWindowSize } from "@uidotdev/usehooks";
import { cn } from "@/lib/cn";

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
    maxWidth: "90%",
    width: "60%",
    height: "fit-content",
    maxHeight: "90%",
    borderRadius: "6px",
    padding: 0,
    inset: 0,
  },
};

export function ModalButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "ml-[17px] flex h-9 w-auto cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-none bg-[#edf2f7] px-3 py-1.5 text-sm font-semibold leading-4 text-[#1a202c] outline-none hover:bg-[#e2e8f0] [&_img]:w-3.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        overlay: {
          ...customStyles.overlay,
          ...overlayStyle,
        },
        content: {
          ...customStyles.content,
          width: widthCheck,
          ...style,
        },
      }}
      shouldCloseOnOverlayClick={false}
    >
      <div className="flex flex-col px-6">
        <div className="flex items-center justify-between border-b-2 border-black py-3 [&>div]:w-1/3 [&>div:nth-of-type(2)]:text-center [&_h4]:whitespace-nowrap">
          {(width ?? 0) < 992 ? (
            <>
              <div>
                <img
                  onClick={() => onClose()}
                  alt="bars"
                  src="/assets/icons/chevron-left.svg"
                  className="cursor-pointer"
                />
              </div>
              <div>
                {typeof header === "string" ? (
                  <h4 id="modal-title" style={{ color: "#171923", fontSize: "18px", margin: 0 }}>
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
                  <h4 id="modal-title" style={{ color: "#171923", fontSize: "18px", margin: 0 }}>
                    {header}
                  </h4>
                ) : (
                  header
                )}
              </div>

              <div></div>

              <div className="flex items-center justify-end">
                {buttons}
                <ModalButton onClick={() => onClose()}>
                  <img
                    alt={"XButton"}
                    src="/public/assets/images/icons/left-icon.svg"
                  />
                </ModalButton>
              </div>
            </>
          )}
        </div>

        <div className={cn("h-full", handleOk === undefined && "remove_scrollbar")}>
          {children}
        </div>
        <div className="footer flex items-center justify-between py-3">
          {footerText ? <div>{footerText}</div> : <div></div>}
          <div className="flex items-center justify-end">
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
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalContainer;
