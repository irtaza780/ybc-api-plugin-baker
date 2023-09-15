import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";

export default async function validateBaker(context, bakerId) {
  const { Accounts } = context.collections;

  const baker = await Accounts.findOne({
    _id: decodeOpaqueId(bakerId).id,
  });

  if (baker?.isBaker) {
    return true;
  } else {
    return false;
  }
}
