import { useSearchParams } from "react-router-dom";

const Nav = () => {
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get("t_page");
  return (
    <div
      role="navigation"
      aria-label="Mypage Navigation"
      className="w-[170px] px-2.5 py-[50px]"
    >
      <h1 role="heading" aria-level={1}>
        {pageType}
      </h1>
    </div>
  );
};

export default Nav;
