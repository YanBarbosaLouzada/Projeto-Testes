import React, {useEffect} from "react";
import "./ProductPage.css";
import AddNewButton from "../../components/UI/AddNewButton/AddNewButton";
import Modal from "../../components/Modal/Modal";
import {useState} from "react";
import axios from "axios";
import Product from "../../components/Product/Product";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import { CATEGORY_LIST } from "../../fn-helpers/categories.jsx";
import {useNavigate} from "react-router-dom";


function ProductPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("todos");
  const navigate = useNavigate();

  const pegarTodasAsProductsDaApi = () => {
    axios
      .get("http://localhost:4444/products/")
      .then((res) => {
        // console.log(res)
        // console.log(res.data)
        setProducts(res.data.products);
      })
      .catch((err) => console.log("erro ao pegar os dados da api", err));
  };

  const createProduct = async (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Você precisa estar logado para cadastrar produtos. Faça login.");
      navigate("/auth");
      return;
    }
    await axios
      .post("http://localhost:4444/products/create-product", {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
      }, { headers: { authorization: token } })
      .then((res) => {
        setProducts([...products, res.data.data]);
      })
      .catch((err) => console.log("erro ao pegar os dados da api", err));
  };

  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token")
    await axios
      .delete(`http://localhost:4444/products/delete-product/${id}`, { headers: { authorization: token } })
      .then((res) => {
        console.log(res)
        // console.log(res.data)
        setProducts(products.filter((n) => n._id !== id));
        // pegarTodasAsProductsDaApi()
      })
      .catch((err) => console.log("erro ao pegar os dados da api", err));
  };

  const editProduct = (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    const token = localStorage.getItem("token")
    axios
      .put(`http://localhost:4444/products/edit-product`, {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
        _id: id,
      }, { headers: { authorization: token } })
      .then((res) => {
        // console.log(res)
        // console.log(res.data)
        let newUpdatedProducts = products.map((n) => {
          if (n._id === id) {
            return res.data.updatedProduct;
          }
          return n;
        });
        setProducts(newUpdatedProducts);
      })
      .catch((err) => console.log("erro ao pegar os dados da api", err));
  };

  useEffect(() => {
    pegarTodasAsProductsDaApi();
    // editProduct(1,"batatadoce","editado")
  }, []);
  const mudarModal = () => {
    setShowModal((state) => !state);
  };

  // function fecharOModal(){
  //   setShowModal(false)
  // }
  // function abrirOModal(){
  //   setShowModal(true)
  // }
  const filteredProducts = filter === "todos" ? products: products.filter((p) => p.type === filter);

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
            count={cat.key === "todos" ? products.length : products.filter((p) => p.type === cat.key).length}
            onClick={() => setFilter(cat.key)}
          />
        ))}
      </div>
      {filteredProducts.length === 0 ? (
        <div className="product-page-empty">
          <p>Nenhum produto encontrado{filter !== "todos" ? ` para "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="Productslist">
          {filteredProducts.map((n) => (
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