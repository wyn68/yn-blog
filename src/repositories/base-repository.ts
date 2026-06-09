import { createClient, createPublicClient } from "@/lib/supabase";
import { devError } from "@/lib/dev";
import type { PostgrestError, PostgrestSingleResponse, PostgrestResponse } from "@supabase/supabase-js";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface RepositoryResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
}

export abstract class BaseRepository {
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected getPublicClient() {
    return createPublicClient();
  }

  protected getClient() {
    return createClient();
  }

  protected logError(error: unknown, context: string): void {
    devError(`[${this.tableName}] Error in ${context}:`, error);
  }

  protected createSuccessResult<T>(data: T): RepositoryResult<T> {
    return { data, error: null, success: true };
  }

  protected createErrorResult<T>(error: unknown, context: string): RepositoryResult<T> {
    this.logError(error, context);
    
    let normalizedError: PostgrestError | Error;
    
    if (error instanceof Error) {
      normalizedError = error;
    } else if (typeof error === 'object' && error !== null && 'code' in error) {
      normalizedError = error as PostgrestError;
    } else {
      normalizedError = new Error(String(error));
    }
    
    return { 
      data: null, 
      error: normalizedError, 
      success: false 
    };
  }

  protected async executeQuery<R>(
    queryFn: () => Promise<PostgrestResponse<R> | PostgrestSingleResponse<R>>,
    context: string
  ): Promise<RepositoryResult<R | R[]>> {
    try {
      const result = await queryFn();
      if (result.error) {
        return this.createErrorResult(result.error, context);
      }
      return this.createSuccessResult(result.data as R | R[]);
    } catch (error) {
      return this.createErrorResult(error, context);
    }
  }

  protected async executeSingleQuery<R>(
    queryFn: () => Promise<PostgrestSingleResponse<R>>,
    context: string
  ): Promise<RepositoryResult<R>> {
    try {
      const result = await queryFn();
      if (result.error) {
        if (result.error.code === 'PGRST116') {
          return this.createSuccessResult(null as R);
        }
        return this.createErrorResult(result.error, context);
      }
      return this.createSuccessResult(result.data as R);
    } catch (error) {
      return this.createErrorResult(error, context);
    }
  }
}
