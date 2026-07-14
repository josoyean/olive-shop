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
    height: "auto",
    maxHeight: "90vh",
    borderRadius: "6px",
    padding: 0,
    inset: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

type ModalButtonVariant = "default" | "primary";

export function ModalButton({
  className,
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ModalButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors outline-none",
        variant === "primary"
          ? "bg-primary text-white hover:bg-[#0e5fe0]"
          : "bg-[#edf2f7] text-text-main hover:bg-[#e2e8f0]",
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
  heightCheck,
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

    return () => {
      document.body.style.overflowY = "auto";
    };
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
          height: heightCheck || "auto",
          maxHeight: heightCheck || "90vh",
          ...style,
        },
      }}
      shouldCloseOnOverlayClick={false}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b-2 border-black px-6 py-3 [&>div]:w-1/3 [&>div:nth-of-type(2)]:text-center [&_h4]:whitespace-nowrap">
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
                  <h4
                    id="modal-title"
                    style={{ color: "#171923", fontSize: "18px", margin: 0 }}
                  >
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
                  <h4
                    id="modal-title"
                    style={{ color: "#171923", fontSize: "18px", margin: 0 }}
                  >
                    {header}
                  </h4>
                ) : (
                  header
                )}
              </div>

              <div></div>

              <div className="flex items-center justify-end gap-2">
                {buttons}
                <button
                  type="button"
                  aria-label="닫기"
                  onClick={() => onClose()}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-sub transition-colors hover:bg-[#f1f3f5] hover:text-text-main"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M1 1l10 10M11 1L1 11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {children}
        </div>

        <div className="footer flex shrink-0 items-center justify-between border-t border-line-sub px-6 py-3">
          {footerText ? <div>{footerText}</div> : <div></div>}
          <div className="flex items-center justify-end">
            <ModalButton
              type="submit"
              variant="primary"
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
