import { supabaseKey, supabaseUrl } from "../supabase";
import axios from "axios";
export async function getProjects() {
  try {
    const response = await axios.get(`${supabaseUrl}/rest/v1/oilve-shop`, {
      headers: {
        apikey: supabaseKey,
      },
    });
    console.log("데이터 패칭 성공", response.data);
    return response.data;
  } catch (error) {
    console.error("데이터 패칭 실패", error);
    return [];
  }
}
