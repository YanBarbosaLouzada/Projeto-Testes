import React from "react";
import "./CategoryCard.css";

function CategoryCard({ icon, label, count, active, accent, onClick }) {
  return (
    <button
      type="button"
      className={`category-card${active ? " active" : ""}`}
      style={{ "--cat-accent": accent }}
      onClick={onClick}
    >
      <span className="category-card-icon">{icon}</span>
      <span className="category-card-label">{label}</span>
      <span className="category-card-count">{count}</span>
    </button>
  );
}

export default CategoryCard;
