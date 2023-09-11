export default async function baker(context, shopId) {
  const { collections } = context;
  const { Shops } = collections;

  console.log("shop id is ", shopId);
  const baker = await Shops.findOne({ _id: shopId });
  console.log("baker is ", baker);

  return baker;
}
