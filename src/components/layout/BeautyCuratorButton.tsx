import { useLocation, useNavigate } from "react-router-dom";

const BeautyCuratorButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/beauty-curator") return null;

  return (
    <button
      type="button"
      aria-label="AI 뷰티 큐레이터 열기"
      title="AI 뷰티 큐레이터"
      onClick={() => navigate("/beauty-curator")}
      className="fixed right-4 bottom-4 z-[1200] flex h-[55px] w-[55px] cursor-pointer items-center justify-center rounded-full border border-primary bg-primary text-white shadow-[0_4px_12px_rgba(17,109,255,0.35)]"
    >
      <span className="text-center text-[11px] font-bold leading-[1.2] text-white">
        AI
        <br />
        큐레이터
      </span>
    </button>
  );
};

export default BeautyCuratorButton;
