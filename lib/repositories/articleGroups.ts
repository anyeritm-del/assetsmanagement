import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { articleGroups } from "../db/schema";
import type { ArticleGroup } from "../types";
import type { ArticleGroupInput } from "../validation/articleGroup";

const repository = createTableRepository(articleGroups, "ArticleGroups");

export async function listArticleGroups(): Promise<ArticleGroup[]> {
  return repository.list();
}

export async function getArticleGroup(id: string): Promise<ArticleGroup | null> {
  return repository.getById(id);
}

export async function createArticleGroup(input: ArticleGroupInput): Promise<ArticleGroup> {
  const now = new Date().toISOString();
  const entity: ArticleGroup = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateArticleGroup(
  id: string,
  patch: Partial<ArticleGroupInput>,
): Promise<ArticleGroup> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
