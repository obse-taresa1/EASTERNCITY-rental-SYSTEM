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
    <div className="container motorx-search-wrap">
      <div className="motorx-search-card">
        <input
          type="radio"
          name="item-tab"
          id="tab-all"
          className="tab-radio"
          checked={status === "all"}
          onChange={() => setStatus("all")}
        />
        <input
          type="radio"
          name="item-tab"
          id="tab-used"
          className="tab-radio"
          checked={status === "used"}
          onChange={() => setStatus("used")}
        />
        <input
          type="radio"
          name="item-tab"
          id="tab-new"
          className="tab-radio"
          checked={status === "new"}
          onChange={() => setStatus("new")}
        />

        <div className="search-tabs">
          <label htmlFor="tab-all">All Items</label>
          <label htmlFor="tab-used">Used Items</label>
          <label htmlFor="tab-new">New Items</label>
        </div>

        <form
          className="search-form-flex home-search-form"
          onSubmit={submitSearch}
        >
          <div className="search-field">
            <label htmlFor="home-search-category">Category</label>
            <select
              className="form-select"
              id="home-search-category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="tools">Tools</option>
              <option value="vehicles">Vehicles</option>
              <option value="cameras">Cameras</option>
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
              title="Max price per day in ETB"
              onChange={(event) => setMaxPrice(event.target.value)}
            />
            <span className="price-val">
              ETB {Number(maxPrice).toLocaleString("en-ET")} / day
            </span>
          </div>

          <button type="submit" className="btn-search-main">
            <span className="search-count">Search Rentals</span>
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
