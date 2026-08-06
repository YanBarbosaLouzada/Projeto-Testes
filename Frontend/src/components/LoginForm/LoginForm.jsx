import React, { useState } from 'react'
import "./LoginForm.css"

export default function LoginForm(props) {

  const [user, setUser] = useState({
    email: "",
    password: "",
  })

  function handleSubmit(e) {
    e.preventDefault()
    props.loginHook(user)
  }

  return (
    <div className="auth-form">
      <h1>Faça seu Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
