export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          product_id: number
          title: string
          price: number
          description: string | null
          category: string
          sold: boolean
          date_of_sale: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: number
          title: string
          price: number
          description?: string | null
          category: string
          sold?: boolean
          date_of_sale: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: number
          title?: string
          price?: number
          description?: string | null
          category?: string
          sold?: boolean
          date_of_sale?: string
          created_at?: string
        }
      }
    }
  }
}