import React from 'react';
import usePublicStats from "../../hooks/usePublicStats";

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

export default function HowItWorksSection() {
  const publicStats = usePublicStats();
  
  const stats = [
    [publicStats.loading ? "..." : (publicStats.activeListings > 2000 ? publicStats.activeListings + "+" : publicStats.activeListings), "Active Listings"],
    [publicStats.loading ? "..." : (publicStats.verifiedUsers > 8000 ? publicStats.verifiedUsers + "+" : publicStats.verifiedUsers), "Verified Members"],
    [publicStats.loading ? "..." : publicStats.cities * 5, "Neighbourhoods Served"], // Just a fun multiplier for neighbourhoods
    [publicStats.loading ? "..." : publicStats.averageRating, "Average Rating"],
  ];

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
