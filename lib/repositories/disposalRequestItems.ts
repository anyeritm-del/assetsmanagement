import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import type { Executor } from "../db/client";
import { disposalRequestItems } from "../db/schema";
import type { DisposalRequestItem } from "../types";

const repository = createTableRepository(disposalRequestItems, "DisposalRequestItems");

export async function listAllDisposalRequestItems(): Promise<DisposalRequestItem[]> {
  return repository.list();
}

export async function listDisposalRequestItems(
  disposalRequestId: string,
): Promise<DisposalRequestItem[]> {
  return repository.list(eq(disposalRequestItems.disposal_request_id, disposalRequestId));
}

export async function createDisposalRequestItem(
  disposalRequestId: string,
  itemId: string,
  executor?: Executor,
): Promise<DisposalRequestItem> {
  const entity: DisposalRequestItem = {
    id: uuidv4(),
    disposal_request_id: disposalRequestId,
    item_id: itemId,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity, executor);
}
