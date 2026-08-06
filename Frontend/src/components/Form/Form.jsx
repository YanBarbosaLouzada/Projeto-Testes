import React, {useState} from "react";
import "./Form.css";
function Form(props) {
  const editingProduct = props.editingProduct;
  const [name, setName] = useState(editingProduct?.name || "");
  const [mark, setMark] = useState(editingProduct?.mark || "");
  const [color, setColor] = useState(editingProduct?.color || "");
  const [description, setDescription] = useState(editingProduct?.description || "");
  const [price, setPrice] = useState(editingProduct?.price || "");
  const [releaseDate, setReleaseDate] = useState(
    editingProduct?.releaseDate ? editingProduct.releaseDate.slice(0, 10) : ""
  );
  const [imageUrl, setImageUrl] = useState(editingProduct?.imageUrl || "");
  const [type, setType] = useState(editingProduct?.type || "outros");

  const CadastrarProduct = (e) => {
    e.preventDefault();
    let id = undefined;
    if (props.editingProduct) {
      id = props.editingProduct._id;
    }
    props.createProduct(name, mark, color, description, price, releaseDate, id, imageUrl, type);
    props.fecharOModal();
  };
  return (
    <form onSubmit={CadastrarProduct} className={"form"}>
      <h1>{props.editingProduct ? "Editar" : "Adicionar"} Produto</h1>
      <label htmlFor="name">Nome</label>
      <input
        type="text"
        placeholder="Nome do produto"
        name="name"
        id="name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <label htmlFor="mark">Marca</label>
      <input
        type="text"
        placeholder="Marca do produto"
        name="mark"
        id="mark"
        onChange={(e) => setMark(e.target.value)}
        value={mark}
      />
      <label htmlFor="color">Cor</label>
      <input
        type="text"
        placeholder="Cor do produto"
        name="color"
        id="color"
        onChange={(e) => setColor(e.target.value)}
        value={color}
      />
      <label htmlFor="description">Descrição</label>
      <input
        value={description}
        type="text"
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição do produto"
        name="description"
        id="description"
      />
      <label htmlFor="price">Preço</label>
      <input
        value={price}
        type="number"
        min="0"
        step="0.01"
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Preço do produto"
        name="price"
        id="price"
      />
      <label htmlFor="releaseDate">Data de lançamento</label>
      <input
        value={releaseDate}
        type="date"
        onChange={(e) => setReleaseDate(e.target.value)}
        name="releaseDate"
        id="releaseDate"
      />
      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
        <option value="outros">Outros</option>
      </select>
      <label htmlFor="imageUrl">URL da imagem</label>
      <input
        value={imageUrl}
        type="url"
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        name="imageUrl"
        id="imageUrl"
      />
      {imageUrl && (
        <img src={imageUrl} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", marginTop: "8px" }} />
      )}
      <button>{props.editingProduct ? "Editar" : "Criar"} produto.</button>
    </form>
  );
}

export default Form;