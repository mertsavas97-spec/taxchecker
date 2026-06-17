import type {
  DbCmsBlogPost,
  DbCmsCalculatorMetadata,
  DbCmsResource,
} from '@/lib/admin/content/storage/mappers';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
      cms_resources: {
        Row: DbCmsResource;
        Insert: Partial<DbCmsResource> & { slug: string; title: string; category: string };
        Update: Partial<DbCmsResource>;
      };
      cms_blog_posts: {
        Row: DbCmsBlogPost;
        Insert: Partial<DbCmsBlogPost> & { slug: string; title: string; category: string };
        Update: Partial<DbCmsBlogPost>;
      };
      cms_calculator_metadata: {
        Row: DbCmsCalculatorMetadata;
        Insert: Partial<DbCmsCalculatorMetadata> & {
          calculator_slug: string;
          title: string;
        };
        Update: Partial<DbCmsCalculatorMetadata>;
      };
      cms_audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Functions: {
      is_admin_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
