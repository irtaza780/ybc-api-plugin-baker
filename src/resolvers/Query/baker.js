import { decodeShopOpaqueId } from "../../xforms/id.js";

export default async function bakers(parent, { shopId }, context, info) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.baker(context, dbShopId);
}
