import { items } from "../data/items.js";

export function getAllItems() {
  return items;
}

export function getItemById(id) {
  return items.find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category) return [];
  return items.filter((item) => item.category === category);
}

export function searchItems(query = "") {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return items;
  }

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
    );
  });
}