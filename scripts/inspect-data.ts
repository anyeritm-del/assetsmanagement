import { listProperties, getProperty } from "../lib/repositories/properties";
import { listItems } from "../lib/repositories/items";
import { listBuildings } from "../lib/repositories/buildings";
import { listFloors } from "../lib/repositories/floors";
import { listRooms } from "../lib/repositories/rooms";
import { listDepartments } from "../lib/repositories/departments";
import { listEquipment } from "../lib/repositories/equipment";
import { listArticleGroups } from "../lib/repositories/articleGroups";
import { listArticles } from "../lib/repositories/articles";
import { listEmployees } from "../lib/repositories/employees";
import { listUsers } from "../lib/repositories/users";
import { listSuppliers } from "../lib/repositories/suppliers";
import { listPurchaseOrders } from "../lib/repositories/purchaseOrders";
import { listMaintenanceCategories } from "../lib/repositories/maintenanceCategories";
import { listMaintenanceAreaTypes } from "../lib/repositories/maintenanceAreaTypes";
import { listAllMaintenanceRequests } from "../lib/repositories/maintenanceRequests";
import { listAllDisposalRequests } from "../lib/repositories/disposalRequests";
import { listAllMovementRequests } from "../lib/repositories/movementRequests";
import { listAllOutgoingRecords } from "../lib/repositories/outgoingRecords";

async function main() {
  const properties = await listProperties();
  for (const p of properties) {
    console.log(`Property: ${p.name} | id=${p.id} | code=${p.code} | status=${p.status}`);
  }

  const [buildings, floors, rooms] = await Promise.all([
    listBuildings(),
    listFloors(),
    listRooms(),
  ]);
  for (const p of properties) {
    const b = buildings.filter((x) => x.property_id === p.id);
    const f = floors.filter((x) => x.property_id === p.id);
    const r = rooms.filter((x) => x.property_id === p.id);
    console.log(`  [${p.name}] buildings=${b.length} floors=${f.length} rooms=${r.length}`);
  }

  const [
    departments,
    equipment,
    articleGroups,
    articles,
    employees,
    users,
    suppliers,
    purchaseOrders,
    maintenanceCategories,
    maintenanceAreaTypes,
    maintenanceRequests,
    disposalRequests,
    movementRequests,
    outgoingRecords,
  ] = await Promise.all([
    listDepartments(),
    listEquipment(),
    listArticleGroups(),
    listArticles(),
    listEmployees(),
    listUsers(),
    listSuppliers(),
    listPurchaseOrders(),
    listMaintenanceCategories(),
    listMaintenanceAreaTypes(),
    listAllMaintenanceRequests(),
    listAllDisposalRequests(),
    listAllMovementRequests(),
    listAllOutgoingRecords(),
  ]);

  console.log("Departments:", departments.map((d) => d.name));
  console.log("Equipment:", equipment.map((e) => e.name));
  console.log("ArticleGroups:", articleGroups.map((a) => a.name));
  console.log("Articles:", articles.map((a) => `${a.name} (group=${a.article_group_id})`));
  console.log("Employees:", employees.length);
  console.log("Users:", users.map((u) => `${u.name} <${u.email}> level=${u.level}`));
  console.log("Suppliers:", suppliers.map((s) => s.name));
  console.log("PurchaseOrders count:", purchaseOrders.length);
  console.log("MaintenanceCategories:", maintenanceCategories.map((m) => m.name));
  console.log("MaintenanceAreaTypes:", maintenanceAreaTypes.map((m) => m.name));
  console.log("MaintenanceRequests count:", maintenanceRequests.length);
  console.log("DisposalRequests count:", disposalRequests.length);
  console.log("MovementRequests count:", movementRequests.length);
  console.log("OutgoingRecords count:", outgoingRecords.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
