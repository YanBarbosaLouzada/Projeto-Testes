import React, { useState } from 'react'
import "../LoginForm/LoginForm.css"
import "./RegisterForm.css"
export default function RegisterForm(props) {

  const [user,setUser] = useState({
    name:"",
    email:"",
    age:"",
    password:"",
    confirmPassword:"",
  })

  function handleSubmit(e) {
    e.preventDefault()
    props.registerHook(user)
  }

  return (
    <div className="auth-form">
      <h1>Faça seu Registro</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          required
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <input
          type="number"
          placeholder="Idade"
          min="0"
          required
          value={user.age}
          onChange={(e) => setUser({ ...user, age: e.target.value === "" ? "" : parseInt(e.target.value) })}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Confirmar senha"
          required
          value={user.confirmPassword}
          onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  )
}
