import { Center } from "@/components/ui/Center";
import { cn } from "@/lib/cn";

const FooterContainer = () => {
  return (
    <footer
      role="contentinfo"
      className="w-screen border-t border-[#aaa] bg-[#f3f3f3] py-10"
    >
      <Center>
        <div
          className={cn(
            "[&_a]:text-[#333] [&_a]:no-underline",
            "[&_p]:text-center [&_p]:text-sm [&_p]:text-[#333]"
          )}
        >
          <p>© 2025 올리브샵. All rights reserved.</p>
          <p className="mt-2">
            이미지 출처:{" "}
            <a
              href="https://www.flaticon.com/kr/free-icons/-"
              title="싸게 사는 물건 아이콘"
            >
              싸게 사는 물건 아이콘 제작자: Freepik - Flaticon
            </a>
          </p>
          <p className="mt-2">개인 프로젝트로 제작되었습니다.</p>
        </div>
      </Center>
    </footer>
  );
};

export default FooterContainer;
