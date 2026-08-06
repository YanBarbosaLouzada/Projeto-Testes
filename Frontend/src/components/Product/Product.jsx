import React from "react";
import { FormatarData } from "../../fn-helpers/FormatDate";
import { CATEGORY_META } from "../../fn-helpers/categories.jsx";
import "./Product.css";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";

function Product(props) {
  const category = CATEGORY_META[props.type] || CATEGORY_META.outros;

  return (
    <div className="product-card" style={{ "--cat-accent": category.accent }}>
      <div className="product-card-media">
        {props.imageUrl ? (
          <img src={props.imageUrl} alt={props.name} />
        ) : (
          <div className="product-card-placeholder">{category.icon}</div>
        )}
        <span className="product-card-badge">
          {category.icon}
          {category.label}
        </span>
        <div className="product-card-actions">
          <button type="button" aria-label="Editar produto" onClick={() => props.setEditMode(props)}>
            <AiFillEdit />
          </button>
          <button type="button" aria-label="Excluir produto" onClick={() => props.deleteProduct(props._id)}>
            <AiFillDelete />
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <h1>{props.name}</h1>
        <p className="product-card-meta">
          <strong>Marca:</strong> {props.mark} · <strong>Cor:</strong> {props.color}
        </p>
        {props.description && <p className="product-card-description">{props.description}</p>}
        <div className="product-card-footer">
          <span className="product-card-price">R$ {Number(props.price).toFixed(2)}</span>
          <span className="product-card-date">{FormatarData(props.releaseDate)}</span>
        </div>
      </div>
    </div>
  );
}

export default Product;
