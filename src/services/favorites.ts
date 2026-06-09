import { favoritesRepository } from "@/repositories/favorites-repository";

export async function addFavorite(postId: string, userId: string) {
  return await favoritesRepository.add(postId, userId);
}

export async function removeFavorite(postId: string, userId: string) {
  return await favoritesRepository.remove(postId, userId);
}

export async function isFavorite(postId: string, userId: string) {
  return await favoritesRepository.check(postId, userId);
}

export async function getUserFavorites(userId: string) {
  return await favoritesRepository.findByUser(userId);
}

export async function getUserFavoriteCount(userId: string) {
  return await favoritesRepository.countByUser(userId);
}
