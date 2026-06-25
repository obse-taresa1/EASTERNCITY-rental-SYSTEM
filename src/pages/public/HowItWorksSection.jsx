const steps = [
  {
    icon: "bi-search",
    title: "Search nearby",
    body: "Filter by city, category, price, availability, and verified owners across EasternCity.",
  },
  {
    icon: "bi-chat-heart",
    title: "Contact the owner safely",
    body: "Use approved contact methods, review rental requirements, and confirm the handoff details.",
  },
  {
    icon: "bi-bag-check",
    title: "Pick up and enjoy",
    body: "Meet the owner, inspect the item, enjoy your rental, and return it on time.",
  },
];

const stats = [
  ["2,400+", "Active Listings"],
  ["8,900+", "Verified Members"],
  ["14", "Neighbourhoods Served"],
  ["4.9", "Average Rating"],
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-premium-red">
      <div className="container">
        <div className="listings-header">
          <div>
            <span className="section-label">HOW IT WORKS</span>
            <h2>Renting in Jigjiga, Dire Dawa, and Harar made simple</h2>
          </div>
        </div>

        <div className="how-premium-grid">
          {steps.map((step, index) => (
            <article className="how-premium-card premium-glass-card" key={step.title}>
              <span className="how-premium-number">{index + 1}</span>
              <i className={`bi ${step.icon}`}></i>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>

        <div className="how-stats-grid">
          {stats.map(([value, label]) => (
            <div className="how-stat-card premium-glass-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
