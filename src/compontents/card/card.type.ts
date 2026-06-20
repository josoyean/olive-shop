export interface CardImageType {
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
  brand_seq?: number;
  brand?: string;
  object_seq?: number;
  object_count?: number;
  one_more: number | null;
  saleItem?: SaleType | undefined | null;
  sale_count?: number;
  brands?: BrandType | undefined | null;
}
export interface BrandType {
  brandImg?: string;
  name: string; // 동적으로 속성 키와 값을 추가
  infoText?: string; // 동적으로 속성 키와 값을 추가
  created_at?: string;
  videoLink?: string | null;
  videoText?: string;
  id: number;
  infoMainText?: string;
  brand_seq: number;
  object?: CardImageType[] | undefined;
}
export interface CardProps {
  size: string;
  option?: boolean;
  img?: string;
  imgSize?: string;
  data?: CardImageType | undefined;

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
  start_today_sale_date: string | undefined;
  end_today_sale_date: string | undefined;
}

export interface CartType {
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
  object_seq?: number;
  brand_seq?: number;
  object_count?: number;
  one_more?: number | null;
  objects?: CardImageType | undefined | null;
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
  id: string;
  userId: string;
  orderId: string;
  delivered_at: string | null;
  updated_at: string;
  created_at: string;
  deliveryStep: number;
  paymentInfo: PaymentType;
  objectsInfo: CardImageType[];
  deliveryInfo: DeliveryInfoType;
  paymentCancel?: boolean;
}
export interface DeliveryInfoType {
  name: string;
  phoneNumber: string;
  address: string;
  enterType: string;
  enterText: string;
}
export interface ReviewType {
  id?: string;
  created_at?: string;
  order_at?: string;
  reviewImg?: string[] | null;
  reviewText?: string;
  userId?: string;
  likeUserId?: string[];
  score?: number;
  objectInfo?: CardImageType;
  userInfo?: UserInfoType | null;
  index?: string;
  img?: string;
  orderId?: string;
  payment_seq?: string;
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
  profileImg?: string | null;
  infoText?: string;
}

export interface StringType {
  [key: string]: string;
}

export interface PaymentObjectType {
  brand_seq?: number;
  count?: number;
  object_count?: number;
  sale_count?: number;
  one_more?: number | null;
  object_seq?: number;
  discount_rate?: number | undefined;
  img?: string;
  name?: string;
  brand?: string;
  payment_seq?: string;
  created_at?: string | null;
  delivered_at?: string | null;
  saleItem?: boolean;
  orderId?: string;
}
export interface FormValues {
  ratingValue: number;
  textValue: string;
}
