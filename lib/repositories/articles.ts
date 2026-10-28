import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { articles } from "../db/schema";
import type { Article } from "../types";
import type { ArticleInput } from "../validation/article";

const repository = createTableRepository(articles, "Articles");

export async function listArticles(): Promise<Article[]> {
  return repository.list();
}

export async function listArticlesByGroup(articleGroupId: string): Promise<Article[]> {
  return repository.list(eq(articles.article_group_id, articleGroupId));
}

export async function getArticle(id: string): Promise<Article | null> {
  return repository.getById(id);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const now = new Date().toISOString();
  const entity: Article = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateArticle(id: string, patch: Partial<ArticleInput>): Promise<Article> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
