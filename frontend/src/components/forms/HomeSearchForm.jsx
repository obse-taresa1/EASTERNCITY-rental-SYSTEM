import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getSefarByCity } from "../../data/sefar.js";
import { fetchCategories } from "../../services/categoryApiService.js";

/** Custom dropdown rendered via a portal so it escapes overflow:hidden parents
 *  and always opens downward (flips up only when near the bottom of the viewport). */
function PortalDropdown({ value, onChange, options, placeholder, style, disabled }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Position the portal menu directly below (or above) the trigger
  function positionMenu() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom;
    const menuH = Math.min(240, options.length * 34 + 8);
    const openUp = spaceBelow < menuH + 8 && rect.top > menuH + 8;

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      // No gap — menu starts exactly where trigger ends so mouse never crosses empty space
      ...(openUp
        ? { bottom: viewportH - rect.top }
        : { top: rect.bottom }),
      background: "#fff",
      border: "1px solid #dee2e6",
      borderRadius: "8px",
      boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
      maxHeight: "240px",
      overflowY: "auto",
      animation: "slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }

  function handleToggle() {
    if (disabled) return;
    if (!open) positionMenu();
    setOpen((v) => !v);
  }

  // ── Close handlers ──────────────────────────────────────────────────────────
  // IMPORTANT: do NOT use capture=true for scroll — that would fire when
  // the user scrolls inside the dropdown menu itself and close it immediately.
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e) {
      // Only close if the click is outside both the trigger AND the portal menu
      if (
        triggerRef.current && triggerRef.current.contains(e.target)
      ) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    // Bubble-phase scroll: only fires when the window itself scrolls,
    // NOT when the user scrolls inside the dropdown <ul>.
    function handleWindowScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleWindowScroll);
    window.addEventListener("resize", handleWindowScroll);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("resize", handleWindowScroll);
    };
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));
  const label = selected ? selected.label : (placeholder || "Select...");

  return (
    <div style={{ position: "relative" }}>
      {/* Inject a tiny style so the trigger button always has a white bg
          regardless of any Bootstrap button reset (background: transparent) */}
      <style>{`
        .hsf-cat-trigger { background-color:#fff!important; color:#212529!important; transition: all 0.2s ease; }
        .hsf-cat-trigger:hover { border-color: #adb5bd !important; }
        .hsf-cat-trigger:focus-visible { border-color: #e31e24 !important; box-shadow: 0 0 0 0.2rem rgba(227, 30, 36, 0.25) !important; outline: none; }
        .hsf-input-field:focus { border-color: #e31e24 !important; box-shadow: 0 0 0 0.2rem rgba(227, 30, 36, 0.25) !important; }
        .hsf-search-btn { transition: all 0.2s ease; }
        .hsf-search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(227,30,36,0.3); }
        .hsf-search-btn:active { transform: translateY(0); }
      `}</style>

      {/* Trigger — styled to match form-select-sm */}
      <button
        ref={triggerRef}
        type="button"
        className="hsf-cat-trigger"
        onClick={handleToggle}
        disabled={disabled}
        style={{
          height: "38px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.5rem",
          fontSize: "0.875rem",
          border: "1px solid #dee2e6",
          borderRadius: "0.375rem",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.65 : 1,
          textAlign: "left",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
          {label}
        </span>
        <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem", marginLeft: "6px", flexShrink: 0, color: "#6c757d" }}></i>
      </button>

      {/* Portal menu — rendered at body level to escape overflow:hidden */}
      {open && createPortal(
        <ul
          ref={menuRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ ...menuStyle, listStyle: "none", margin: 0, padding: "4px 0" }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                padding: "6px 12px",
                fontSize: "0.875rem",
                cursor: "pointer",
                backgroundColor: String(opt.value) === String(value) ? "rgba(227,30,36,0.08)" : "transparent",
                color: String(opt.value) === String(value) ? "#e31e24" : "#212529",
                fontWeight: String(opt.value) === String(value) ? 600 : 400,
                userSelect: "none",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(227,30,36,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = String(opt.value) === String(value) ? "rgba(227,30,36,0.08)" : "transparent"; }}
            >
              {opt.label}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}


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
    if (search.trim() !== "") params.set("keyword", search.trim());
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.5rem",
            alignItems: "end",
          }}>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: "0.8rem", height: "20px", display: "flex", alignItems: "center" }}>
                <i className="bi bi-search text-danger me-1"></i>
                {t("keyword") || "Keyword"}
              </label>
              <input
                type="text"
                className="form-control form-control-sm border hsf-input-field"
                placeholder={t("searchPlaceholder") || "Search keyword..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: "38px", borderRadius: "6px", padding: "0 0.75rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: "0.8rem", height: "20px", display: "flex", alignItems: "center" }}>
                <i className="bi bi-geo-alt text-danger me-1"></i>
                {t("location") || "Location"}
              </label>
              <PortalDropdown
                value={city}
                onChange={(val) => {
                  setCity(val);
                  setSefar("all"); // reset sefar when city changes
                }}
                placeholder={t("allCities") || "All Cities"}
                options={[
                  { value: "all", label: t("allCities") || "All Cities" },
                  { value: "Jigjiga", label: "Jigjiga" },
                  { value: "Dire Dawa", label: "Dire Dawa" },
                  { value: "Harar", label: "Harar" },
                ]}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: "0.8rem", height: "20px", display: "flex", alignItems: "center" }}>
                <i className="bi bi-signpost text-danger me-1"></i>
                {t("sefar") || "Neighbourhood"}
              </label>
              <PortalDropdown
                value={sefar}
                onChange={setSefar}
                disabled={city === "all"}
                placeholder={city === "all" ? (t("selectCityFirst") || "Select City...") : (t("allSefar") || "All Sefars")}
                options={[
                  { value: "all", label: city === "all" ? (t("selectCityFirst") || "Select City...") : (t("allSefar") || "All Sefars") },
                  ...sefarOptions.map((s) => ({ value: s, label: s })),
                ]}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: "0.8rem", height: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <i className="bi bi-tag text-danger me-1"></i>
                  {t("maxPrice") || "Max Price"}
                </span>
                <span className="text-danger fw-bold" style={{ fontSize: "0.7rem" }}>{Number(maxPrice).toLocaleString()}</span>
              </label>
              <div style={{ height: "38px", display: "flex", alignItems: "center" }}>
                <input
                  type="range"
                  className="form-range"
                  min="1000"
                  max="25000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setIsPriceFilterActive(true); }}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: "0.8rem", height: "20px", display: "flex", alignItems: "center" }}>
                <i className="bi bi-grid text-danger me-1"></i>
                {t("category") || "Category"}
              </label>
              <PortalDropdown
                value={category}
                onChange={setCategory}
                placeholder={t("allCategories") || "All Categories"}
                options={[
                  { value: "all", label: t("allCategories") || "All Categories" },
                  ...categoryOptions.map((item) => ({ value: item.id, label: item.name })),
                ]}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ height: "20px", marginBottom: "4px" }}></div>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold d-flex align-items-center justify-content-center gap-1 hsf-search-btn"
                style={{ height: "38px", borderRadius: "8px", whiteSpace: "nowrap", padding: "0 1.25rem" }}
              >
                <i className="bi bi-search" style={{ fontSize: "0.85rem" }}></i>
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
