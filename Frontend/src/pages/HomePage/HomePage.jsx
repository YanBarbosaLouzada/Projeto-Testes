import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <span className="home-eyebrow">Mynds</span>
        <h1>Encontre o produto certo, do jeito que você gosta.</h1>
        <p>
          Catálogo simples para cadastrar, organizar e explorar produtos por
          categoria. Crie sua conta, adicione seus itens e converse com o
          suporte quando precisar.
        </p>
        <div className="home-actions">
          <Link to="/products" className="home-btn home-btn-primary">
            Ver produtos
          </Link>
          <Link to="/auth" className="home-btn home-btn-secondary">
            Entrar / Criar conta
          </Link>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <h2>Catálogo organizado</h2>
          <p>Filtre produtos por categoria e visualize tudo em cartões claros.</p>
        </div>
        <div className="home-feature-card">
          <h2>Cadastro rápido</h2>
          <p>Adicione, edite e remova produtos em poucos cliques.</p>
        </div>
        <div className="home-feature-card">
          <h2>Suporte em tempo real</h2>
          <p>Fale com a equipe de suporte diretamente pelo chat.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
