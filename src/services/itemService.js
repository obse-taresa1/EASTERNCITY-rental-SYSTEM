import { items } from "../data/items.js";

export function getItems() {
  return items;
}

export function getItemById(id) {
  return items.find((item) => item.id === id) || null;
}

export function getItemByTitle(title) {
  const normalizedTitle = title.toLowerCase().trim();

  return (
    items.find((item) => item.title.toLowerCase().trim() === normalizedTitle) ||
    null
  );
}
