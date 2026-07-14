import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "py-10",
        "[&_h1]:mb-10 [&_h1]:text-center",
        "[&_button]:!h-[50px] [&_button]:!w-[400px] [&_button]:!rounded-md [&_button]:!border [&_button]:!border-line-sub [&_button]:!px-5 [&_button]:!text-[15px] [&_button]:!text-text-main",
        "[&_input[type=password]]:h-[50px] [&_input[type=password]]:w-[400px] [&_input[type=password]]:rounded-md [&_input[type=password]]:border [&_input[type=password]]:border-line-sub [&_input[type=password]]:px-5 [&_input[type=password]]:text-[15px] [&_input[type=password]]:text-text-main [&_input[type=password]]:focus:border-text-main [&_input[type=password]]:focus:outline-none",
        "[&_input[type=text]]:h-[50px] [&_input[type=text]]:w-[400px] [&_input[type=text]]:rounded-md [&_input[type=text]]:border [&_input[type=text]]:border-line-sub [&_input[type=text]]:px-5 [&_input[type=text]]:text-[15px] [&_input[type=text]]:text-text-main [&_input[type=text]]:focus:border-text-main [&_input[type=text]]:focus:outline-none",
        "[&_form]:flex [&_form]:flex-col [&_form]:items-center",
        className
      )}
    >
      {children}
    </div>
  );
}

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  width: string;
  height?: string | null;
}

export function InputBox({ width, height, className, style, ...props }: InputBoxProps) {
  return (
    <input
      className={cn(
        "rounded-md border border-line-sub px-2.5 text-[15px] text-text-main placeholder:text-[13px] focus:border-text-main focus:outline-none",
        className
      )}
      style={{ width, height: height || "50px", ...style }}
      {...props}
    />
  );
}

interface InputWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "button";
}

export function InputWrapper({ children, className, variant = "default" }: InputWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-[25px]",
        "[&_button]:border-transparent [&_button]:text-[15px]",
        "[&_button[type=submit]]:bg-primary [&_button[type=submit]]:!text-white",
        "[&_button[type=button]]:bg-black [&_button[type=button]]:!text-white",
        "[&_span]:block [&_span]:w-20 [&_span]:text-sm",
        "[&>div]:relative [&>div]:flex [&>div]:w-[500px] [&>div]:items-center [&>div]:justify-between [&>div]:gap-5",
        "[&>div_em]:absolute [&>div_em]:bottom-[-16px] [&>div_em]:left-[105px] [&>div_em]:text-xs [&>div_em]:text-text-red",
        variant === "button" && "mt-10 w-[500px] flex-row",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ObjectsBoxProps {
  children: ReactNode;
  className?: string;
}

export function ObjectsBox({ children, className }: ObjectsBoxProps) {
  return (
    <div
      className={cn(
        "my-[45px] border-y border-line-main py-[25px]",
        "[&>.tBox]:flex [&>.tBox]:items-center [&>.tBox]:justify-between",
        "[&>.tBox_.filter]:flex [&>.tBox_.filter]:items-center [&>.tBox_.filter]:gap-[15px]",
        "[&>.tBox_.filter_img]:cursor-pointer",
        "[&>.tBox_.filter_span]:relative [&>.tBox_.filter_span]:block [&>.tBox_.filter_span]:cursor-pointer [&>.tBox_.filter_span]:text-xs [&>.tBox_.filter_span]:text-text-sub",
        "[&>.tBox_.filter_span]:after:absolute [&>.tBox_.filter_span]:after:right-[-8px] [&>.tBox_.filter_span]:after:top-0 [&>.tBox_.filter_span]:after:content-['_|_']",
        "[&>.tBox_.filter_span:last-child]:after:hidden",
        "[&>.bBox]:mt-10 [&>.bBox]:grid [&>.bBox]:grid-cols-4 [&>.bBox]:gap-x-[33px] [&>.bBox]:gap-y-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GreenButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-7 rounded-[5px] !border !border-olive-green bg-white px-[5px] !text-xs leading-7 !text-olive-green",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface ColorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width: string;
  height: string;
}

export function BlueButton({ width, height, className, style, children, ...props }: ColorButtonProps) {
  return (
    <button
      className={cn("whitespace-nowrap rounded-[3px] bg-primary text-white", className)}
      style={{ width, height, lineHeight: height, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

export function WhiteButton({
  width,
  height,
  className,
  style,
  children,
  ...props
}: ColorButtonProps & { width: string | null }) {
  return (
    <button
      className={cn(
        "whitespace-nowrap rounded-[3px] border border-primary bg-white text-primary",
        className
      )}
      style={{ width: width || "auto", height, lineHeight: height, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  width: string;
  height?: string | null;
}

export function TextareaField({ width, height, className, style, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "resize-none rounded-md border border-line-sub p-2.5 text-[15px] text-text-main placeholder:text-[13px] focus:border-text-main focus:outline-none",
        className
      )}
      style={{ width, height: height || "120px", ...style }}
      {...props}
    />
  );
}

export function TableWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "[&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0",
        "[&_thead]:h-10 [&_th]:border-b [&_th]:border-t-2 [&_th]:border-[#d6d6d6] [&_th]:border-b-[#ccc] [&_th]:bg-[#fafafa] [&_th]:p-[5px] [&_th]:text-center [&_th]:text-sm [&_th]:text-[#666]",
        "[&_td]:border-b [&_td]:border-[#ccc]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  grid: number;
  children: ReactNode;
  className?: string;
}

export function Tabs({ grid, children, className, ...props }: TabsProps) {
  return (
    <div
      className={cn("my-[30px] mb-10 grid", className)}
      style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabItem({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className={cn("relative text-center", active && "on")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-[50px] w-full text-lg font-normal leading-[50px] text-[#666] bg-[#f6f6f6]",
          active && "bg-[#555] text-white after:absolute after:bottom-[-5px] after:left-1/2 after:ml-[-6px] after:block after:h-[5px] after:w-3 after:bg-[url(https://static.oliveyoung.co.kr/pc-static-root/image/comm/bg_tab_arrow.png)] after:bg-no-repeat after:content-['']"
        )}
      >
        {children}
      </button>
    </div>
  );
}

interface StarBoxProps extends React.HTMLAttributes<HTMLUListElement> {
  size?: string;
  children: ReactNode;
  className?: string;
}

export function StarBox({ size = "20px", children, className, ...props }: StarBoxProps) {
  return (
    <ul
      className={cn(
        "flex gap-1",
        "[&_li]:relative [&_li]:[width:var(--star-size)] [&_li]:[height:var(--star-size)]",
        "[&_li_span]:absolute [&_li_span]:left-0 [&_li_span]:top-0 [&_li_span]:z-[4] [&_li_span]:block [&_li_span]:h-[var(--star-size)] [&_li_span]:w-full [&_li_span]:bg-star",
        "[&_li_img]:absolute [&_li_img]:z-[9] [&_li_img]:h-[var(--star-size)] [&_li_img]:w-[var(--star-size)] [&_li_img]:overflow-hidden",
        className
      )}
      style={{ "--star-size": size } as CSSProperties}
      {...props}
    >
      {children}
    </ul>
  );
}

export function InfoText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-semibold text-red-600", className)}>{children}</span>;
}
