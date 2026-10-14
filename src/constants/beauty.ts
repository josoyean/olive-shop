export const BEAUTY_OBJECT_TYPES = [
  "선케어",
  "스킨케어",
  "바디케어",
  "마스크팩",
] as const;

export function isBeautyObjectType(type?: string | null) {
  return BEAUTY_OBJECT_TYPES.includes(
    type as (typeof BEAUTY_OBJECT_TYPES)[number],
  );
}
