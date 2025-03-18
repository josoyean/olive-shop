import { createClient } from "@supabase/supabase-js";
import { Database } from "supabase.types";

const supabase = createClient<Database>(
  `${import.meta.env.VITE_SUPABASE_URL}`,
  import.meta.env.VITE_SUPABASE_KEY
);
export { supabase };

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
