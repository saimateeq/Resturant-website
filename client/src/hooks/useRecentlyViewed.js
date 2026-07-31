const STORAGE_KEY = 'savoria-recently-viewed';
const MAX_ITEMS = 8;

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(dish) {
  const existing = getRecentlyViewed().filter((d) => d._id !== dish._id);
  const entry = {
    _id: dish._id,
    name: dish.name,
    slug: dish.slug,
    images: dish.images,
    price: dish.price,
    discountPrice: dish.discountPrice,
    ratingsAverage: dish.ratingsAverage,
  };
  const updated = [entry, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
