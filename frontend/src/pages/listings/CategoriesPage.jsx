import { Link } from 'react-router-dom';

import { useLanguage } from '../../context/LanguageContext.jsx';
import { categories } from '../../data/items.js';
import SectionHeader from '../../components/common/SectionHeader.jsx';


export default function CategoriesPage() {
  const { t } = useLanguage();
  const categoryOptions = categories;

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
