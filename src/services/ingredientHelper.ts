import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const CACHE_PREFIX = "olive-ingredient-ai:";
/** 전성분이 길면 앞부분만 AI에 전달 (속도·토큰 절약) */
const MAX_INGREDIENT_ITEMS = 8;

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

function cacheKey(objectSeq: number | string | undefined, ingredients: string) {
  return `${CACHE_PREFIX}${objectSeq ?? "unknown"}:${ingredients.length}:${ingredients.slice(0, 40)}`;
}

function readCache(key: string) {
  try {
    return localStorage.getItem(key)?.trim() || "";
  } catch {
    return "";
  }
}

function writeCache(key: string, text: string) {
  try {
    localStorage.setItem(key, text);
  } catch {
    // quota 등은 무시
  }
}

function pickTopIngredients(ingredients: string) {
  return ingredients
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_INGREDIENT_ITEMS)
    .join(", ");
}

/** 성분을 초보자가 이해하기 쉽게 짧게 설명 (캐시 우선) */
export async function explainIngredients(params: {
  productName?: string;
  ingredients: string;
  objectSeq?: number;
}): Promise<string> {
  const ingredients = params.ingredients.trim();
  if (!ingredients) {
    throw new Error("등록된 성분 정보가 없습니다.");
  }

  const key = cacheKey(params.objectSeq, ingredients);
  const cached = readCache(key);
  if (cached) return cached;

  const shortList = pickTopIngredients(ingredients);
  const prompt = [
    `상품: ${params.productName || "뷰티 상품"}`,
    `성분: ${shortList}`,
    "핵심 3개만 각 1문장 + 요약 1문장. 한국어. 과장 금지. 제목/목록기호 없이.",
  ].join("\n");

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 160,
      thinkingConfig: {
        thinkingLevel: "minimal",
      },
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("AI 설명을 받지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  writeCache(key, text);
  return text;
}
