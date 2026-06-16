import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeSearchForm() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(15600);
  const [status, setStatus] = useState("all");

  function submitSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    params.set("category", category);
    params.set("maxPrice", maxPrice);

    if (status !== "all") {
      params.set("status", status);
    }

    const target = category === "all" ? "/items" : `/category/${category}`;
    navigate(`${target}?${params.toString()}`);
  }

  return (
    <section id="home-search" className="home-search-section">
      <div className="container">
        <form className="search-box" onSubmit={submitSearch}>
          <div className="search-field">
            <label htmlFor="home-search-category">Category</label>
            <select
              id="home-search-category"
              className="form-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="tools">Tools</option>
              <option value="cameras">Cameras</option>
              <option value="vehicles">Vehicles</option>
              <option value="sports">Sports</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>

          <div className="search-field search-price">
            <label htmlFor="home-search-price">Max Price</label>
            <input
              id="home-search-price"
              name="maxPrice"
              type="range"
              className="form-range"
              min="1000"
              max="20000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
            <span className="price-val">
              ETB {Number(maxPrice).toLocaleString("en-ET")} / day
            </span>
          </div>

          <div className="search-field">
            <label htmlFor="home-search-status">Condition</label>
            <select
              id="home-search-status"
              className="form-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All Items</option>
              <option value="new">New Items</option>
              <option value="used">Used Items</option>
            </select>
          </div>

          <button type="submit" className="btn-accent-custom">
            <i className="bi bi-search"></i> Search Rentals
          </button>
        </form>
      </div>
    </section>
  );
}
