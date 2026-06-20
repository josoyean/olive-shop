import { createClient } from "@supabase/supabase-js";
import { Database } from "supabase.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_KEY를 확인해주세요. (등호 앞뒤 공백 없이 작성)"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export { supabase };
export { supabaseUrl, supabaseKey };
