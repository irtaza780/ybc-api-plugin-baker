export default async function bakers(context, args) {
  const { collections } = context;
  const { Shops } = collections;
  console.log("args are ", args);

  const { filter, searchQuery } = args;

  console.log("search query ", searchQuery);

  const selector = {};
  if (filter?.city) {
    selector["addressBook.0.city"] = filter.city;
  }

  if (filter?.region) {
    selector["addressBook.0.region"] = filter.region;
  }

  if (searchQuery) {
    selector.$or = [
      {
        name: {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        description: {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        slug: {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
    ];
  }

  console.log("selector is ", selector);

  return Shops.find(selector);
}
