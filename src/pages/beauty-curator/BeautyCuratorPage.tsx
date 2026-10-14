import { useState, type FormEvent } from "react";
import { Center } from "@/components/ui/Center";
import { PageHero } from "@/components/layout/PageHero";
import ObjectCardColumn from "@/components/card/ObjectCardColumn";
import type { CardImageType } from "@/components/card/card.type";
import {
  BUDGET_OPTIONS,
  SKIN_CONCERNS,
  SKIN_TYPES,
  buildCuratorAnalysisPreview,
  generateCuratorAnalysis,
  pickCuratorProducts,
  type BudgetValue,
  type SkinConcern,
  type SkinType,
} from "@/services/beautyCurator";
import { cn } from "@/lib/cn";

const BeautyCuratorPage = () => {
  const [skinType, setSkinType] = useState<SkinType | "">("");
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [budget, setBudget] = useState<BudgetValue | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [products, setProducts] = useState<CardImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    Boolean(skinType) && concerns.length > 0 && budget != null && !loading;

  const toggleConcern = (concern: SkinConcern) => {
    setConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!skinType || budget == null || concerns.length === 0 || loading) return;

    setLoading(true);
    setAnalysisLoading(false);
    setError("");
    setAnalysis("");
    setProducts([]);

    const form = { skinType, concerns, budget };

    try {
      // 1) 상품은 로컬 선정 → 바로 카드 표시
      const picked = await pickCuratorProducts(form);
      if (picked.length === 0) {
        throw new Error("해당 예산에 맞는 상품이 없습니다. 예산을 올려보세요.");
      }
      setProducts(picked);
      // 즉시 미리보기 문구 → AI 응답 오면 교체
      setAnalysis(buildCuratorAnalysisPreview(form, picked));
      setLoading(false);

      setAnalysisLoading(true);
      const text = await generateCuratorAnalysis(form, picked);
      setAnalysis(text);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "요청 중 오류가 발생했습니다.";
      setError(message);
      setLoading(false);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="AI 뷰티 큐레이터"
        subtitle="조건을 고르면 맞춤 상품 카드를 추천해드려요"
      />
      <Center className="pb-20 pt-10">
        <section aria-label="AI 뷰티 큐레이터" className="mx-auto w-full">
          <div className="mb-8">
            <p className="text-sm font-bold text-primary">STEP 1</p>
            <h2 className="mt-1 text-2xl font-bold text-text-main">
              피부 타입을 선택해 주세요.
            </h2>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-8 border border-line-main px-8 py-8"
          >
            <fieldset>
              <legend className="mb-3 text-base font-bold text-text-main">
                피부 타입
              </legend>
              <div
                role="radiogroup"
                aria-label="피부 타입"
                className="flex flex-wrap gap-2"
              >
                {SKIN_TYPES.map((type) => {
                  const selected = skinType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSkinType(type)}
                      className={cn(
                        "h-11 min-w-22 rounded border px-4 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-line-main bg-white text-text-sub hover:border-primary hover:text-primary",
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-base font-bold text-text-main">
                주요 피부 고민{" "}
                <span className="font-normal text-text-sub">(복수 선택)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((concern) => {
                  const selected = concerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleConcern(concern)}
                      className={cn(
                        "h-11 rounded border px-4 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-line-main bg-white text-text-sub hover:border-primary hover:text-primary",
                      )}
                    >
                      {concern}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-base font-bold text-text-main">
                예산
              </legend>
              <div className="flex flex-col gap-3">
                {BUDGET_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm transition-colors",
                      budget === option.value
                        ? "border-primary bg-[#f3f8ff] text-primary"
                        : "border-line-main text-text-sub hover:border-primary",
                    )}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={budget === option.value}
                      onChange={() => setBudget(option.value)}
                      className="h-4 w-4 accent-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 rounded bg-primary text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "상품 찾는 중..." : "이 조건으로 추천받기"}
            </button>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded border border-sale/40 bg-[#fff5f5] px-4 py-3 text-sm text-sale"
            >
              {error}
            </p>
          )}

          {(analysis || analysisLoading || products.length > 0) && (
            <section aria-live="polite" className="mt-12">
              <p className="text-sm font-bold text-primary">STEP 2</p>
              <h2 className="mt-1 text-2xl font-bold text-text-main">
                AI 분석 결과
              </h2>

              {analysis && (
                <article className="mt-5 whitespace-pre-wrap rounded border border-line-main bg-[#fafafa] px-5 py-5 text-[15px] leading-7 text-text-main">
                  {analysis}
                  {analysisLoading && (
                    <p className="mt-3 text-sm text-text-sub">
                      AI가 추천 문구를 다듬는 중이에요...
                    </p>
                  )}
                </article>
              )}

              {products.length > 0 && (
                <>
                  <h3 className="mt-10 mb-5 text-lg font-bold text-text-main">
                    추천 상품
                  </h3>
                  <div className="grid grid-cols-[repeat(4,230px)] justify-between gap-y-10">
                    {products.map((item) => (
                      <ObjectCardColumn
                        key={item.object_seq}
                        size="230px"
                        data={item}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </section>
      </Center>
    </>
  );
};

export default BeautyCuratorPage;
