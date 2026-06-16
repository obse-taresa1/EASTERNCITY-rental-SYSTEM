export default function SimplePublicPage({ title, subtitle, children }) {
  return (
    <main className="container page-header pb-5">
      <section className="card card-custom p-4 p-lg-5">
        <span className="section-label">CITYRENT</span>
        <h1 className="h3 mb-3">{title}</h1>
        {subtitle && <p className="text-muted mb-4">{subtitle}</p>}
        {children}
      </section>
    </main>
  );
}
