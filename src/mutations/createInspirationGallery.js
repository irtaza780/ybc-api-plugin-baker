import Random from "@reactioncommerce/random";
import validateBaker from "../util/validateBaker.js";
export default async function createInspirationGallery(context, args) {
  const { userId, collections } = context;
  const { InspirationGallery } = collections;
  const { occasion, title, images } = args;

  const isBaker = await validateBaker(context, userId);

  if (!isBaker) {
    throw new Error("You are not a baker");
  }

  const gallery = {
    _id: Random.id(),
    occasion,
    title,
    images,
    bakerId: userId,
  };

  console.log("galerry is ", gallery);

  await InspirationGallery.insertOne(gallery);

  return gallery;
}
