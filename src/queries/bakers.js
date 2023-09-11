export default async function bakers(context) {
  const { collections } = context;
  const { Shops } = collections;

  return Shops.find({});
}
