import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function HomeSearchForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          <label htmlFor="tab-all">{t("allItems")}</label>
          <label htmlFor="tab-used">{t("usedItems")}</label>
          <label htmlFor="tab-new">{t("newItems")}</label>
        </div>

        <form
          className="search-form-flex home-search-form"
          onSubmit={submitSearch}
        >
          <div className="search-field">
            <label htmlFor="home-search-category">{t("category")}</label>
            <select
              className="form-select"
              id="home-search-category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">{t("allCategories")}</option>
              <option value="electronics">{t("electronics")}</option>
              <option value="tools">{t("tools")}</option>
              <option value="vehicles">{t("vehicles")}</option>
              <option value="cameras">{t("cameras")}</option>
              <option value="sports">{t("sports")}</option>
              <option value="furniture">{t("furniture")}</option>
            </select>
          </div>

          <div className="search-field search-price">
            <label htmlFor="home-search-price">{t("maxPrice")}</label>
            <input
              id="home-search-price"
              name="maxPrice"
              type="range"
              className="form-range"
              min="1000"
              max="20000"
              value={maxPrice}
              title={t("maxPriceTitle")}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
            <span className="price-val">
              ETB {Number(maxPrice).toLocaleString("en-ET")} / {t("perDay")}
            </span>
          </div>

          <button type="submit" className="btn-search-main">
            <span className="search-count">{t("searchRentals")}</span>
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
