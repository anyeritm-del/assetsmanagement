import QRCode from "qrcode";
import { getAppUrl } from "./appUrl";
import { getBuilding } from "./repositories/buildings";
import { getFloor } from "./repositories/floors";
import { getItem } from "./repositories/items";
import { getRoom } from "./repositories/rooms";

export interface ItemLabelData {
  itemId: string;
  name: string;
  code: string;
  locationLine: string;
  qrDataUrl: string;
}

export async function buildItemLabelData(itemId: string): Promise<ItemLabelData | null> {
  const item = await getItem(itemId);
  if (!item) return null;

  const [building, room] = await Promise.all([
    getBuilding(item.building_id),
    item.room_id ? getRoom(item.room_id) : Promise.resolve(null),
  ]);
  const floor = room ? await getFloor(room.floor_id) : null;
  const itemUrl = `${getAppUrl()}/items/${item.id}/view`;
  const qrDataUrl = await QRCode.toDataURL(itemUrl, { margin: 1, width: 300 });

  return {
    itemId: item.id,
    name: item.name,
    code: item.code,
    locationLine: [building?.name, floor?.name, room?.name].filter(Boolean).join(" / "),
    qrDataUrl,
  };
}
