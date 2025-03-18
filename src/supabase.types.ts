export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      objects: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          brand: string;
          img: string;
          tags: string[];
          sale: boolean;
          count: number;
          best: boolean;
          discount_rate: number;
          brand_seq: number;
          object_seq: number;
        };
        Insert: {
          id?: number; // Supabase에서 자동 생성 가능
          created_at?: string; // 생성 시 자동 입력 가능
          name: string;
          brand: string;
          img: string;
          tags?: string[]; // 필수 아니면 optional 처리
          sale: boolean;
          count: number;
          best: boolean;
          discount_rate: number;
          brand_seq: number;
          object_seq: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          brand?: string;
          img?: string;
          tags?: string[];
          sale?: boolean;
          count?: number;
          best?: boolean;
          discount_rate?: number;
          brand_seq?: number;
          object_seq?: number;
        };
      };
      banners: {
        Row: {
          object_seq: number;
          created_at: string;
          item: string;
          img: string;
          id: number;
        };
        Insert: {
          object_seq: number;
          created_at: string;
          item: string;
          img: string;
          id: number;
        };
        Update: {
          object_seq: number;
          created_at: string;
          item: string;
          img: string;
          id: number;
        };
      };
      weeklyItems: {
        Row: {
          img: string;
          mainText: string;
          subText: string;
          created_at: string;
          object_seq: number;
          id: number;
        };
        Insert: {
          img: string;
          mainText: string;
          subText: string;
          created_at: string;
          object_seq: number;
          id: number;
        };
        Update: {
          img: string;
          mainText: string;
          subText: string;
          created_at: string;
          object_seq: number;
          id: number;
        };
      };
      carts: {
        Row: {
          id: number;
          userId: string;
          name: string;
          img: string;
          tags: string[];
          sale: boolean;
          discount_rate: number;
          count: number;
          best: boolean;
          attention: boolean;
          recommend: boolean;
          created_at: string;
          object_seq: number;
          brand: string;
          brand_seq: number;
        };
        Insert: {
          id?: number;
          userId: string;
          name: string;
          img: string;
          tags?: string[];
          sale: boolean;
          discount_rate: number;
          count: number;
          best: boolean;
          attention: boolean;
          recommend: boolean;
          created_at: string;
          object_seq: number;
          brand: string;
          brand_seq: number;
        };
      };
    };
  };
}
