export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collections: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_collection_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_collection_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_collection_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_parent_collection_id_fkey"
            columns: ["parent_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          order_position: number | null
          recipe_id: string | null
          unit: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          order_position?: number | null
          recipe_id?: string | null
          unit?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_position?: number | null
          recipe_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      instructions: {
        Row: {
          created_at: string | null
          description: string
          estimated_time: number | null
          id: string
          image_url: string | null
          recipe_id: string | null
          step_number: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_time?: number | null
          id?: string
          image_url?: string | null
          recipe_id?: string | null
          step_number?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_time?: number | null
          id?: string
          image_url?: string | null
          recipe_id?: string | null
          step_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          appearance_rating: number | null
          cook_date: string | null
          created_at: string | null
          ease_rating: number | null
          flavor_rating: number | null
          id: string
          notes: string | null
          rating_value: number | null
          recipe_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appearance_rating?: number | null
          cook_date?: string | null
          created_at?: string | null
          ease_rating?: number | null
          flavor_rating?: number | null
          id?: string
          notes?: string | null
          rating_value?: number | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appearance_rating?: number | null
          cook_date?: string | null
          created_at?: string | null
          ease_rating?: number | null
          flavor_rating?: number | null
          id?: string
          notes?: string | null
          rating_value?: number | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_collections: {
        Row: {
          added_at: string | null
          collection_id: string
          recipe_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          recipe_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_collections_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          cook_time: number | null
          created_at: string
          cuisine: string | null
          deleted_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          meal_type: string | null
          nutrition: Json | null
          prep_time: number | null
          searchable: unknown | null
          servings: number | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          version_number: number | null
        }
        Insert: {
          category?: string | null
          cook_time?: number | null
          created_at?: string
          cuisine?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          meal_type?: string | null
          nutrition?: Json | null
          prep_time?: number | null
          searchable?: unknown | null
          servings?: number | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
          version_number?: number | null
        }
        Update: {
          category?: string | null
          cook_time?: number | null
          created_at?: string
          cuisine?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          meal_type?: string | null
          nutrition?: Json | null
          prep_time?: number | null
          searchable?: unknown | null
          servings?: number | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
          version_number?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      search_recipes: {
        Args: {
          search_query: string
          min_prep_time?: number
          max_prep_time?: number
          meal_types?: string[]
          cuisines?: string[]
          dietary_tags?: string[]
          exclude_ingredients?: string[]
          user_id?: string
        }
        Returns: {
          category: string | null
          cook_time: number | null
          created_at: string
          cuisine: string | null
          deleted_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          meal_type: string | null
          nutrition: Json | null
          prep_time: number | null
          searchable: unknown | null
          servings: number | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          version_number: number | null
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
