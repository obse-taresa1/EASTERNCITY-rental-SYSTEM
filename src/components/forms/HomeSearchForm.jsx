import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getSefarByCity } from "../../data/sefar.js";
import { fetchCategories } from "../../services/categoryApiService.js";

function mergeCategoryOptions(apiCategories = []) {
  const merged = new Map();

  categories.forEach((category) => {
    merged.set(category.id, category);
  });

  apiCategories.forEach((category) => {
    const key = category.slug || category.id;
    if (!key) return;
    merged.set(key, {
      id: key,
      name: category.name,
    });
  });

  return [...merged.values()];
}

export default function HomeSearchForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [sefar, setSefar] = useState("all");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [status, setStatus] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState(categories);

  const sefarOptions = city !== "all" ? getSefarByCity(city) : [];

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();
        if (active) setCategoryOptions(mergeCategoryOptions(data));
      } catch {
        if (active) setCategoryOptions(categories);
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  function handleCityChange(e) {
    setCity(e.target.value);
    setSefar("all"); // reset sefar when city changes
  }

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim() !== "") params.set("search", search.trim());
    if (category !== "all") params.set("category", category);
    if (city !== "all") params.set("city", city);
    if (sefar !== "all") params.set("sefar", sefar);
    params.set("maxPrice", maxPrice);
    if (status !== "all") params.set("condition", status);

    navigate(`/items?${params.toString()}`);
  }

  return (
    <div
      className="container motorx-search-wrap ms-0"
      style={{
        maxWidth: "960px",
        margin: "-40px auto 0 0",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="bg-white p-3 rounded-4 shadow-lg border"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
      >
        <form onSubmit={submitSearch}>
          <div className="row g-2 align-items-end">
            {/* 1. Keyword Search */}
            <div className="col-md-2 text-start">
              <label
                className="form-label text-dark fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-search text-danger me-1"></i>
                {t("keyword") || "Keyword"}
              </label>
              <input
                type="text"
                className="form-control form-control-sm border shadow-sm"
                placeholder={t("searchPlaceholder") || "Search keyword..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* 2. City */}
            <div className="col-md-2 text-start">
              <label
                className="form-label text-dark fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-geo-alt text-danger me-1"></i>
                {t("location") || "City"}
              </label>
              <select
                className="form-select form-select-sm border shadow-sm"
                value={city}
                onChange={handleCityChange}
              >
                <option value="all">{t("allCities") || "All Cities"}</option>
                <option value="Jigjiga">Jigjiga</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Harar">Harar</option>
              </select>
            </div>

            {/* 3. Sefar (Neighbourhood) */}
            <div className="col-md-2 text-start">
              <label
                className="form-label text-dark fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-signpost text-danger me-1"></i>
                {t("sefar") || "Sefar"}
              </label>
              <select
                className="form-select form-select-sm border shadow-sm"
                value={sefar}
                onChange={(e) => setSefar(e.target.value)}
                disabled={city === "all"}
              >
                <option value="all">
                  {city === "all"
                    ? t("selectCityFirst") || "Select City..."
                    : t("allSefar") || "All Sefars"}
                </option>
                {sefarOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Category */}
            <div className="col-md-2 text-start">
              <label
                className="form-label text-dark fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-grid text-danger me-1"></i>
                {t("category") || "Category"}
              </label>
              <select
                className="form-select form-select-sm border shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">
                  {t("allCategories") || "All Categories"}
                </option>
                {categoryOptions.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Price */}
            <div className="col-md-2 text-start">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  className="text-dark fw-bold"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="bi bi-tag text-danger me-1"></i>
                  {t("maxPrice") || "Max Price"}
                </span>
                <span
                  className="text-danger fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  {Number(maxPrice).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min="1000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setIsPriceFilterActive(true);
                }}
                style={{ height: "24px" }}
              />
            </div>

            {/* 6. Submit Button */}
            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-danger w-100 btn-sm fw-bold d-flex align-items-center justify-content-center gap-1"
                style={{ padding: "0.45rem", borderRadius: "8px" }}
              >
                <i className="bi bi-search" style={{ fontSize: "0.85rem" }}></i>{" "}
                {t("search") || "Search"}
              </button>
            </div>
          </div>

          <div
            className="d-flex justify-content-center gap-3 mt-2 pt-2 border-top text-dark"
            style={{ fontSize: "0.75rem" }}
          >
            <label className="d-flex align-items-center gap-1 cursor-pointer m-0">
              <input
                type="radio"
                name="status"
                checked={status === "all"}
                onChange={() => setStatus("all")}
                className="form-check-input mt-0"
                style={{ width: "13px", height: "13px" }}
              />
              <span>{t("anyCondition") || "Any Condition"}</span>
            </label>
            <label className="d-flex align-items-center gap-1 cursor-pointer m-0">
              <input
                type="radio"
                name="status"
                checked={status === "new"}
                onChange={() => setStatus("new")}
                className="form-check-input mt-0"
                style={{ width: "13px", height: "13px" }}
              />
              <span>{t("likeNew") || "Like New"}</span>
            </label>
            <label className="d-flex align-items-center gap-1 cursor-pointer m-0">
              <input
                type="radio"
                name="status"
                checked={status === "used"}
                onChange={() => setStatus("used")}
                className="form-check-input mt-0"
                style={{ width: "13px", height: "13px" }}
              />
              <span>{t("used") || "Used"}</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
