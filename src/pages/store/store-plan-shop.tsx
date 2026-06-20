import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryMenu from "../../components/CategoryMenu";
import type { PlanShopType } from "components/card/card.type";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import EmptyComponent from "../../components/EmptyComponent";
import { PageHero } from "@/components/layout/PageHero";
import { Center } from "@/components/ui/Center";
import { cn } from "@/lib/cn";

const StorePlanShopList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const menuType = searchParams.get("menuType");
  const [objects, setObjects] = useState<PlanShopType[]>([]);
  const handleData = useCallback(async () => {
    const { data: planData } = await supabase.from("planObject").select("*");
    const brandSeqList = planData?.map((item) => item.brand_seq);
    if (brandSeqList?.length === 0) {
      setObjects([]);
      return;
    }
    let query = supabase
      .from("objects")
      .select("*,saleItem(*)")
      .eq("soldOut", "False");

    if (menuType !== "전체") {
      query = query.eq("objectTypeMain", menuType);
    }
    query.in("brand_seq", brandSeqList ?? []);
    const { data: objectsData } = await query;

    const grouped = (brandSeqList ?? []).map((brand_seq) => ({
      ...planData?.find((item) => item.brand_seq === brand_seq),
      objects: objectsData?.filter((obj) => obj.brand_seq === brand_seq),
    }));

    const groupedFilter = grouped.filter((item) => item.objects.length >= 2);

    setObjects(groupedFilter ?? []);
  }, [menuType]);
  useEffect(() => {
    handleData();
  }, [handleData]);
  return (
    <section role="region" aria-label="기획전">
      <PageHero
        title="기획전"
        subtitle="꼭 갖고 싶은 그 상품들! 다양한 혜택까지!"
        className="h-[150px] bg-[url('/public/assets/images/icons/bg_promo_top.png')] bg-[position:50%_0] bg-no-repeat [&_em]:text-inherit [&_span]:text-inherit"
      />
      <Center>
        <div>
          <CategoryMenu style={{ margin: "-38px 0 0 0" }} />
          <div>
            {objects.length !== 0 && (
              <h2 className="my-[60px] mb-[35px] text-center">
                지금 진행 중인 행사예요
              </h2>
            )}
            <div
              className={cn(
                objects.length === 0 ? "block" : "grid grid-cols-2 gap-x-5"
              )}
            >
              {objects && objects?.length > 0 ? (
                <>
                  {objects?.map((object) => (
                    <div key={object?.brand_seq}>
                      <div
                        className="imgBox relative h-[330px] w-[500px] cursor-pointer [&_em]:absolute [&_em]:bottom-[25px] [&_em]:left-1/2 [&_em]:-translate-x-1/2 [&_em]:overflow-hidden [&_em]:text-ellipsis [&_em]:whitespace-nowrap [&_em]:text-xl [&_em]:font-light [&_em]:text-white [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_p]:absolute [&_p]:bottom-[70px] [&_p]:left-1/2 [&_p]:-translate-x-1/2 [&_p]:overflow-hidden [&_p]:text-ellipsis [&_p]:whitespace-nowrap [&_p]:text-center [&_p]:text-[28px] [&_p]:font-bold [&_p]:leading-[31.2px] [&_p]:text-white"
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(
                            `/store/brand-detail?getBrand=${object?.brand_seq}`
                          );
                        }}
                      >
                        <img
                          src={object?.img}
                          alt="이벤트 이미지"
                          style={{ filter: "brightness(80%)" }}
                        />
                        <p
                          dangerouslySetInnerHTML={{
                            __html: object?.main_text,
                          }}
                        ></p>
                        <em>{object?.sub_text}</em>
                      </div>
                      <div className="textBox relative z-[1] -mt-4 mx-3 mb-3 grid w-[475px] grid-cols-2 gap-5 bg-white p-[15px_15px_37px] [grid-template-columns:repeat(2,215px)] [&_.tags]:text-center [&_h5]:text-center">
                        <ObjectCardColumn
                          size="215px"
                          data={object?.objects[0]}
                        />
                        <ObjectCardColumn
                          size="215px"
                          data={object?.objects[1]}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <EmptyComponent
                  mainText="선택 결과가 없어요"
                  subText="기획전 타입을 다시 선택해주세요"
                />
              )}
            </div>
          </div>
        </div>
      </Center>
    </section>
  );
};

export default StorePlanShopList;
