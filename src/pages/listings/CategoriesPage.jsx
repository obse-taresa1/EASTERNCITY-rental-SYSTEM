import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { categories } from '../../data/items.js';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import { fetchCategories } from '../../services/categoryApiService.js';

function mergeCategories(apiCategories = []) {
  const merged = new Map();

  categories.forEach((category) => {
    merged.set(category.id, category);
  });

  apiCategories.forEach((category) => {
    const key = category.slug || category.id;
    if (!key) return;
    const existing = merged.get(key) || {};
    merged.set(key, {
      ...existing,
      ...category,
      id: key,
      icon: existing.icon || 'bi-grid',
      description: category.description || existing.description || '',
    });
  });

  return [...merged.values()];
}

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categoryOptions, setCategoryOptions] = useState(categories);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();
        if (active) setCategoryOptions(mergeCategories(data));
      } catch {
        if (active) setCategoryOptions(categories);
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow={t('categories')}
        title={t('browseCategories')}
        description={t('browseCategoriesDescription')}
      />
      <div className="row g-4 mt-4">
        {categoryOptions.map((cat) => (
          <div className="col-sm-6 col-md-4 col-lg-3 d-flex" key={cat.id}>
            <Link
              to={`/categories/${cat.id}`}
              className="about-value-card text-decoration-none d-block w-100"
            >
              <i className={`bi ${cat.icon}`}></i>
              <h4>{cat.name}</h4>
              <p>{cat.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
