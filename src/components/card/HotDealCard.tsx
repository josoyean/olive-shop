import moment from "moment";
import { useNavigate } from "react-router-dom";
import type { CardImageType } from "./card.type";
import { ProductPrice } from "../product/ProductPrice";
import { ProductTags } from "../product/ProductTags";
import { useAddToCart } from "@/hooks/useAddToCart";

const HotDealCard = ({ data }: { data: CardImageType }) => {
  const navigate = useNavigate();
  const { handleAddToCart, cartIconUrl } = useAddToCart();

  const discountRate =
    (data?.saleItem?.discount_rate || 0) +
    (data?.saleItem?.today_discount_rate || 0);

  return (
    <article
      role="article"
      className="w-[500px] cursor-pointer"
      onClick={(event) => {
        event.preventDefault();
        navigate(`/store/goods-detail?getGoods=${data?.object_seq}`);
      }}
    >
      <div className="img_box relative h-[255px] w-[500px] bg-[rgba(184,184,184,0.3)]" role="group">
        <img
          role="img"
          src={data?.img}
          className="img mx-auto block h-[255px] w-[255px] object-cover"
          alt={data?.name || "상품 이미지"}
        />
        <span className="absolute left-2.5 top-2.5 z-[1] block h-[60px] w-[60px] bg-[url('https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/public/images/pc_flag.png')] bg-[length:60px_60px] bg-no-repeat">
          <span className="block text-center text-2xl font-bold leading-[60px] text-white">
            {discountRate}%
          </span>
        </span>

        {data?.soldOut && (
          <div className="absolute bottom-0 left-1/2 top-0 z-[1] flex h-[255px] w-[255px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-[3px] bg-[rgba(0,0,0,0.5)] px-2.5 text-xl font-bold text-white">
            <em>품절</em>
          </div>
        )}
      </div>

      <div className="text_box mt-5 flex flex-col gap-[7px]" role="group">
        <img
          role="button"
          src={cartIconUrl}
          alt="shopping"
          aria-label="장바구니 추가"
          className="ml-auto w-[30px] cursor-pointer"
          onClick={(event) => handleAddToCart(event, data)}
        />
        <em role="heading" aria-level={3} className="text-base text-black">
          {data?.name}
        </em>
        <ProductPrice
          saleItem={data?.saleItem}
          count={data?.count}
          option={data?.option}
          layout="hotdeal"
        />
        <ProductTags
          data={data}
          variant="outline"
          showTodaySale={
            moment().isBetween(
              data?.saleItem?.start_today_sale_date,
              data?.saleItem?.end_today_sale_date
            ) || false
          }
        />
      </div>
    </article>
  );
};

export default HotDealCard;
