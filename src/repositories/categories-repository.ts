import { BaseRepository } from "./base-repository";
import { devError } from "@/lib/dev";
import type { Category } from "@/types";
import type { CategoryWithPostCount, CategoryWithPosts } from "./types";

export class CategoriesRepository extends BaseRepository {
  constructor() {
    super("categories");
  }

  async findAll(): Promise<Category[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        devError('Error fetching categories:', error);
        return [];
      }
      return (data as Category[]) || [];
    } catch (error) {
      devError('Unexpected error in findAll:', error);
      return [];
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) {
        if (error.code !== 'PGRST116') {
          devError('Error fetching category by slug:', error);
        }
        return null;
      }
      return data as Category;
    } catch (error) {
      devError('Unexpected error in findBySlug:', error);
      return null;
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
      if (error && error.code !== 'PGRST116') {
        devError('Error fetching category by id:', error);
      }
      return data as Category | null;
    } catch (error) {
      devError('Unexpected error in findById:', error);
      return null;
    }
  }

  async create(category: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("categories")
        .insert([category])
        .select()
        .single();
      if (error) {
        devError('Error creating category:', error);
        return null;
      }
      return data as Category;
    } catch (error) {
      devError('Unexpected error in create:', error);
      return null;
    }
  }

  async createBulk(categories: Omit<Category, "id" | "created_at" | "updated_at">[]): Promise<Category[] | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("categories")
        .insert(categories)
        .select();
      if (error) {
        devError('Error creating categories bulk:', error);
        return null;
      }
      return data as Category[];
    } catch (error) {
      devError('Unexpected error in createBulk:', error);
      return null;
    }
  }

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        devError('Error updating category:', error);
        return null;
      }
      return data as Category;
    } catch (error) {
      devError('Unexpected error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) {
        devError('Error deleting category:', error);
        return false;
      }
      return true;
    } catch (error) {
      devError('Unexpected error in delete:', error);
      return false;
    }
  }

  async findAllWithPostCount(): Promise<CategoryWithPostCount[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*, posts(id)")
        .order("name", { ascending: true });
      if (error) {
        devError('Error fetching categories with post count:', error);
        return [];
      }
      
      return (data as CategoryWithPosts[]).map((cat) => ({
        ...cat,
        count: cat.posts?.length || 0,
      })) as CategoryWithPostCount[];
    } catch (error) {
      devError('Unexpected error in findAllWithPostCount:', error);
      return [];
    }
  }

  async findManyWithPostCount(offset: number, limit: number): Promise<CategoryWithPostCount[]> {
    try {
      const supabase = this.getPublicClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*, posts(id)")
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) {
        devError('Error fetching categories with post count:', error);
        return [];
      }
      
      return (data as CategoryWithPosts[]).map((cat) => ({
        ...cat,
        count: cat.posts?.length || 0,
      })) as CategoryWithPostCount[];
    } catch (error) {
      devError('Unexpected error in findManyWithPostCount:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const supabase = this.getPublicClient();
      const { count, error } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true });
      if (error) {
        devError('Error counting categories:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      devError('Unexpected error in count:', error);
      return 0;
    }
  }
}

export const categoriesRepository = new CategoriesRepository();
