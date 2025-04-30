export interface CardImageType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object; // 동적으로 속성 추가 가능
  name?: string; // 동적으로 속성 키와 값을 추가
  img?: string; // 동적으로 속성 키와 값을 추가
  sale?: boolean;
  discount_rate?: number | undefined;
  count?: number | undefined;
  best?: boolean;
  attention?: boolean;
  option?: boolean;
  recommend?: boolean;
  coupon?: boolean;
  created_at?: string;
  view_count?: number | undefined;
  soldOut?: boolean;
  subImg?: string[];
  detailImg?: string;
  objectTypeMain?: string;
  objectTypeSub?: string;
  brand_seq: number;
  brand: string;
  object_seq: number;
  object_count?: number;
  one_more: number | null;
  saleItem?: SaleType | undefined | null;
}
export interface BrandType {
  [key: string]: string | string[] | boolean | number | undefined; // 동적으로 속성 추가 가능
  brandImg?: string;
  name: string; // 동적으로 속성 키와 값을 추가
  infoText: string; // 동적으로 속성 키와 값을 추가
  created_at?: string;
  videoLink?: string;
  videoText?: string;
  id: number;
  brand_seq: number;
}
export interface CardProps {
  size: string;
  option?: boolean;
  img?: string;
  imgSize?: string;
  data: CardImageType;
  onClick?: () => void | undefined;
}

interface menuType {
  name: string;
  path?: string;
  type?: string;
}
export const filteredSearch: menuType[] = [
  { name: "인기순", type: "popular" },
  { name: "낮은 가격순", type: "lowPrice" },
  { name: "높은 가격순", type: "highPrice" },
  { name: "할인율순", type: "sale" },
];

// export interface HotDealCardType {
//   object_seq?: number | undefined;
//   today_sale?: boolean | undefined;
//   objects?: CardImageType;
//   start_sale_date?: string;
//   end_sale_date?: string;
//   created_at?: string;
//   today_sale_date?: string;
//   count?: number;
//   discount_rate?: number;
//   id?: number;
//   object_count?: number | undefined;
//   one_more: number | null;
// }

export interface PlanShopType {
  brand_seq: number | undefined;
  created_at: string;
  img: string;
  main_text: string;
  sub_text: string;
  objects: CardImageType[];
}

export interface EventType {
  id: number;
  event_seq: number | undefined;
  created_at: string;
  buy_member: boolean;
  on_line: boolean;
  off_line: boolean;
  img: string;
  main_title: string;
  sub_title: string;
  start_date: string;
  end_date: string;
  detail_text: string;
  detail_img: string;
}

export interface SaleType {
  id: number;
  created_at: string | undefined;
  object_seq: number | undefined;
  discount_rate: number | undefined;
  today_discount_rate: number | undefined;
  start_sale_date: string | undefined;
  end_sale_date: string | undefined;
  one_more: number | null;
  today_sale_date: string | undefined;
}

export interface CartType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object; // 동적으로 속성 추가 가능
  name?: string; // 동적으로 속성 키와 값을 추가
  img?: string; // 동적으로 속성 키와 값을 추가
  sale?: boolean;
  discount_rate?: number | undefined;
  count?: number | undefined;
  best?: boolean;
  attention?: boolean;
  option?: boolean;
  recommend?: boolean;
  coupon?: boolean;
  created_at?: string;
  view_count?: number | undefined;
  soldOut?: boolean;
  subImg?: string[];
  detailImg?: string;
  objectTypeMain?: string;
  objectTypeSub?: string;
  brand?: string;
  object_seq: number;
  brand_seq?: number;
  object_count?: number;
  one_more?: number | null;
  objects?: CardImageType | undefined | null;
  payment_seq?: string;
}

export interface PaymentType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object; // 동적으로 속성 추가 가능
  object_seq: number;
  created_at?: string;
  orderId?: string;
}

export interface OrderType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object;
}

export interface ReviewType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object;
  id?: string;
  created_at?: string;
  reviewImg?: string[];
  reviewText?: string;
  userId?: string;
  likeUserId?: string[];
  score?: number;
  object_seq?: number;
  userInfo?: UserInfoType;
  img?: string;
  index?: string;
}

export interface UserInfoType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object;
  createdAt?: string;
  birthDy?: string;
  phoneNumber?: string;
  name?: string;
  id?: string;
  email?: string;
  userId?: string;
  addressMain?: string;
  addressSub?: string;
  postNumber?: string;
  deliveryPhone?: string;
  enterInfo?: string;
  deliveryName?: string;
  nickName?: string;
  profileImg?: string;
  infoText?: string;
}

export interface StringType {
  [key: string]:
    | string
    | string[]
    | boolean
    | number
    | undefined
    | null
    | object;
}
