import React, { useEffect, useState } from "react";
import "./ProductPage.css";
import AddNewButton from "../../components/UI/AddNewButton/AddNewButton";
import Modal from "../../components/Modal/Modal";
import Product from "../../components/Product/Product";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import { CATEGORY_LIST } from "../../fn-helpers/categories.jsx";
import { useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../../services/api";


function ProductPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    api.get("/products/", {
      params: {
        page,
        limit: 20,
        ...(filter !== "todos" ? { type: filter } : {})
      },
      signal: controller.signal
    }).then(({ data }) => {
      setProducts((current) => page === 1 ? data.products : [...current, ...data.products]);
      setHasMore(page < data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
        setHasMore(false);
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [filter, page, retryCount]);

  const createProduct = async (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    try {
      const { data } = await api.post("/products/create-product", {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
      });
      setProducts((current) => [data.data, ...current]);
      setTotalCount((count) => count + 1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível cadastrar o produto."));
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/delete-product/${id}`);
      setProducts((current) => current.filter((product) => product._id !== id));
      setTotalCount((count) => Math.max(0, count - 1));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível excluir o produto."));
    }
  };

  const editProduct = async (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    try {
      const { data } = await api.put("/products/edit-product", {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
        _id: id,
      });
      setProducts((current) => current.map((product) =>
        product._id === id ? data.updatedProduct : product
      ));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível editar o produto."));
    }
  };

  const mudarModal = () => {
    setShowModal((state) => !state);
  };

  return (
    <div className="product-page">
      <AddNewButton abrirOModal={mudarModal} />
      {showModal ? (
        <Modal createProduct={createProduct} fecharOModal={mudarModal} />
      ) : null}
      {editingProduct ? (
        <Modal
          createProduct={editProduct}
          editingProduct={editingProduct}
          fecharOModal={() => setEditingProduct(null)}
        />
      ) : null}
      <div className="product-page-header">
        <h1>Produtos</h1>
        <p>Explore, cadastre e gerencie os produtos do catálogo.</p>
      </div>
      <div className="category-list">
        {CATEGORY_LIST.map((cat) => (
          <CategoryCard
            key={cat.key}
            icon={cat.icon}
            label={cat.label}
            accent={cat.accent}
            active={filter === cat.key}
            count={filter === cat.key ? totalCount : undefined}
            onClick={() => {
              if (filter !== cat.key) {
                setProducts([]);
                setPage(1);
                setTotalCount(0);
                setLoading(true);
                setErrorMessage("");
                setFilter(cat.key);
              }
            }}
          />
        ))}
      </div>
      {errorMessage && <p className="product-page-error" role="alert">{errorMessage}</p>}
      {errorMessage && page === 1 && (
        <button type="button" onClick={() => {
          setLoading(true);
          setErrorMessage("");
          setRetryCount((count) => count + 1);
        }}>
          Tentar novamente
        </button>
      )}
      {loading && page === 1 ? (
        <p role="status">Carregando produtos...</p>
      ) : products.length === 0 ? (
        <div className="product-page-empty">
          <p>Nenhum produto encontrado{filter !== "todos" ? ` para "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="Productslist">
          {products.map((n) => (
            <Product
              key={n._id}
              {...n}
              deleteProduct={deleteProduct}
              editProduct={editProduct}
              setEditMode={(data) => setEditingProduct(data)}
            />
          ))}
        </div>
      )}
      {hasMore && (
        <button type="button" onClick={() => {
          setLoading(true);
          setPage((current) => current + 1);
        }} disabled={loading}>
          {loading ? "Carregando..." : "Carregar mais"}
        </button>
      )}
      <button
        className="support-button"
        onClick={() => navigate("/chatpage")}
        aria-label="Falar com o suporte"
        title="Falar com o suporte"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>Suporte</span>
      </button>
    </div>
  );
}

export default ProductPage;