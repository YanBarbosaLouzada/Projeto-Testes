import React, {useState} from "react";
import "./AddNewButton.css";
function AddNewButton(props) {
  const [mouse, setMouse] = useState(true);
  return (
    <div
      onMouseLeave={() => setMouse(true)}
      onMouseEnter={() => setMouse(false)}
      onClick={() => props.abrirOModal()}
      className={`${mouse ? "addNewButton" : "addNewButton-mouse"}`}
    >
      {mouse ? "+" : "Adicionar um produto"}
    </div>
  );
}

export default AddNewButton;