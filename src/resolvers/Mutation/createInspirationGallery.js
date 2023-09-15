import ReactionError from "@reactioncommerce/reaction-error";

export default async function createInspirationGallery(
  _,
  { input },
  context,
  info
) {
  const { userId } = context;

  if (!userId) throw new ReactionError("access-denied", "Access Denied");

  return await context.mutations.createInspirationGallery(context, input);
}
