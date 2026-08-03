import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Article } from "../types";
import { articleSchema } from "../validation/article";
import type { ArticleInput } from "../validation/article";

const HEADERS = [
  "id",
  "article_group_id",
  "name",
  "code",
  "unit",
  "content",
  "created_at",
  "updated_at",
];

function fromRow(record: Record<string, unknown>): Article | null {
  const parsed = articleSchema.safeParse({
    id: String(record.id ?? ""),
    article_group_id: String(record.article_group_id ?? ""),
    name: String(record.name ?? ""),
    code: String(record.code ?? ""),
    unit: String(record.unit ?? ""),
    content: Number(record.content ?? 0),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Articles row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Article): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Article>({
  sheetName: "Articles",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listArticles(): Promise<Article[]> {
  return repository.list();
}

export async function listArticlesByGroup(articleGroupId: string): Promise<Article[]> {
  const all = await repository.list();
  return all.filter((article) => article.article_group_id === articleGroupId);
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
