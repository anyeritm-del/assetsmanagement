import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { ArticleGroup } from "../types";
import { articleGroupSchema } from "../validation/articleGroup";
import type { ArticleGroupInput } from "../validation/articleGroup";

const HEADERS = ["id", "name", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): ArticleGroup | null {
  const parsed = articleGroupSchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Article Groups row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: ArticleGroup): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<ArticleGroup>({
  sheetName: "ArticleGroups",
  headers: HEADERS,
  fromRow,
  toRow,
});

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
