import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { CardImageType } from "@/components/card/card.type";
import {
  BEAUTY_OBJECT_TYPES,
  isBeautyObjectType,
} from "@/constants/beauty";
import { supabase } from "@/supabase";
import { handlePrice } from "@/utils/common";

export { BEAUTY_OBJECT_TYPES, isBeautyObjectType } from "@/constants/beauty";

/**
 * 속도 전략:
 * - 상품 선정: DB + 로컬 키워드 스코어링 (즉시)
 * - AI: 짧은 추천 문구만 생성 (가벼운 프롬프트)
 */
/** 문구 생성만 하므로 lite면 충분 (토큰·비용 최소) */
const GEMINI_MODEL = "gemini-3.5-flash-lite";
/** AI 문구용으로만 상위 몇 개 상품명 전달 (화면에는 전체 표시) */
const ANALYSIS_NAME_COUNT = 3;

export const SKIN_TYPES = ["건성", "지성", "복합성", "민감성"] as const;
export const SKIN_CONCERNS = [
  "수분 부족",
  "트러블",
  "피지·모공",
  "피부 톤",
  "탄력",
] as const;
export const BUDGET_OPTIONS = [
  { label: "2만 원 이하", value: 20000 },
  { label: "3만 원 이하", value: 30000 },
  { label: "5만 원 이하", value: 50000 },
] as const;

export type SkinType = (typeof SKIN_TYPES)[number];
export type SkinConcern = (typeof SKIN_CONCERNS)[number];
export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

export interface CuratorFormInput {
  skinType: SkinType;
  concerns: SkinConcern[];
  budget: BudgetValue;
}

export interface CuratorResult {
  analysis: string;
  products: CardImageType[];
}

const CONCERN_KEYWORDS: Record<SkinConcern, string[]> = {
  "수분 부족": [
    "수분",
    "보습",
    "촉촉",
    "히알루론",
    "크림",
    "토너",
    "에센스",
    "세럼",
  ],
  트러블: ["트러블", "여드름", "진정", "시카", "티트리", "클렌징", "약산성"],
  "피지·모공": ["모공", "피지", "클린", "오일", "패드", "토너", "클렌징"],
  "피부 톤": ["톤업", "미백", "비타민", "나이아신", "광채", "선크림", "쿠션"],
  탄력: ["탄력", "리프팅", "주름", "콜라겐", "레티놀", "아이크림"],
};

const SKIN_KEYWORDS: Record<SkinType, string[]> = {
  건성: ["건성", "수분", "보습", "크림", "오일", "장벽"],
  지성: ["지성", "피지", "오일프리", "젤", "라이트", "매트"],
  복합성: ["복합성", "밸런스", "수분", "토너", "에멀전"],
  민감성: ["민감", "진정", "무자극", "저자극", "시카", "약산성"],
};

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

function getEffectivePrice(product: CardImageType) {
  return handlePrice(product.saleItem ?? null, product.count ?? 0);
}

function productText(product: CardImageType) {
  return [
    product.name,
    product.brand,
    product.objectTypeMain,
    product.objectTypeSub,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreProduct(product: CardImageType, form: CuratorFormInput) {
  const text = productText(product);
  let score = 0;

  for (const keyword of SKIN_KEYWORDS[form.skinType]) {
    if (text.includes(keyword.toLowerCase())) score += 3;
  }
  for (const concern of form.concerns) {
    for (const keyword of CONCERN_KEYWORDS[concern]) {
      if (text.includes(keyword.toLowerCase())) score += 2;
    }
  }
  if (product.best) score += 2;
  if (product.recommend) score += 2;
  if (product.attention) score += 1;
  score += Math.min(3, Math.floor((product.view_count ?? 0) / 1000));

  return score;
}

/** 예산 이하 상품 전체 조회 후 관련도 순 정렬 */
export async function pickCuratorProducts(
  form: CuratorFormInput,
): Promise<CardImageType[]> {
  const { data, error } = await supabase
    .from("objects")
    .select("*,saleItem(*)")
    .in("objectTypeMain", [...BEAUTY_OBJECT_TYPES])
    .lte("count", form.budget)
    .order("view_count", { ascending: false });

  if (error) {
    throw new Error("상품 목록을 불러오지 못했습니다.");
  }

  const withinBudget = ((data ?? []) as CardImageType[])
    .filter((item) => isBeautyObjectType(item.objectTypeMain))
    .filter((item) => !item.soldOut)
    .filter((item) => getEffectivePrice(item) > 0)
    .filter((item) => getEffectivePrice(item) <= form.budget);

  if (withinBudget.length === 0) return [];

  return [...withinBudget].sort((a, b) => {
    const scoreDiff = scoreProduct(b, form) - scoreProduct(a, form);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.view_count ?? 0) - (a.view_count ?? 0);
  });
}

/** 즉시 표시용 문구 (AI 대기 없이) */
export function buildCuratorAnalysisPreview(
  form: CuratorFormInput,
  products: CardImageType[],
) {
  const names = products
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean)
    .join(", ");
  return `${form.skinType} 피부와 ${form.concerns.join("·")} 고민을 기준으로 ${form.budget.toLocaleString()}원 이하 상품을 골랐어요.${names ? ` ${names} 등을 우선 확인해보세요.` : ""}`;
}

/** AI는 짧은 추천 문구만 생성 (상품 선정은 로컬) */
export async function generateCuratorAnalysis(
  form: CuratorFormInput,
  products: CardImageType[],
): Promise<string> {
  const productNames = products
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, ANALYSIS_NAME_COUNT)
    .join(", ");

  const prompt = [
    `${form.skinType} 피부, 고민: ${form.concerns.join(", ")}, 예산 ${form.budget.toLocaleString()}원 이하.`,
    `추천 상품: ${productNames || "없음"}.`,
    "위 조건에 맞는 추천 이유를 한국어 2문장으로만 작성하세요. JSON/목록/이모지 금지.",
  ].join("\n");

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 80,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });
    const text = response.text?.trim();
    return text || buildCuratorAnalysisPreview(form, products);
  } catch {
    // 무료 티어 지연/실패 시에도 UI는 바로 동작
    return buildCuratorAnalysisPreview(form, products);
  }
}

export async function recommendBeautyProducts(
  form: CuratorFormInput,
): Promise<CuratorResult> {
  if (!form.skinType) {
    throw new Error("피부 타입을 선택해주세요.");
  }
  if (form.concerns.length === 0) {
    throw new Error("피부 고민을 하나 이상 선택해주세요.");
  }
  if (!form.budget) {
    throw new Error("예산을 선택해주세요.");
  }

  const products = await pickCuratorProducts(form);
  if (products.length === 0) {
    throw new Error("해당 예산에 맞는 상품이 없습니다. 예산을 올려보세요.");
  }

  const analysis = await generateCuratorAnalysis(form, products);
  return { analysis, products };
}
