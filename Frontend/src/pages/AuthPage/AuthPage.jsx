import React, { useState } from 'react'
import "./AuthPage.css"
import axios from "axios"
import LoginForm from '../../components/LoginForm/LoginForm'
import RegisterForm from '../../components/RegisterForm/RegisterForm'
import { useNavigate } from 'react-router-dom'
function AuthPage() {
  const navigate = useNavigate()
  const [registerPage, setRegisterPage] = useState(true)
  const [message, setMessage] = useState(null)

  function switchPage(toRegister) {
    setRegisterPage(toRegister)
    setMessage(null)
  }

  async function registerHook(data) {
    setMessage(null)
    try {
      const response = await axios.post("http://localhost:4444/auth/register", data)

      if (response.status === 200) {
        setMessage({ type: "success", text: "Conta criada com sucesso! Faça login para continuar." })
        setRegisterPage(false)
      }

    } catch (error) {
      console.error(error)
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Não foi possível criar sua conta. Tente novamente.",
      })
    }
  }

  async function loginHook(data) {
    setMessage(null)
    try {
      const response = await axios.post("http://localhost:4444/auth/login", data)

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token)
        window.dispatchEvent(new Event("storage"))
        navigate("/products")
      }

    } catch (error) {
      console.error(error)
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Não foi possível entrar. Tente novamente.",
      })
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {message && (
          <div className={`auth-message auth-message-${message.type}`}>{message.text}</div>
        )}
        {registerPage ? (
          <div>
            <RegisterForm registerHook={registerHook} />
            <p className="switch-text" onClick={() => switchPage(false)}>
              Já tem conta? Ir para login
            </p>
          </div>
        ) : (
          <div>
            <LoginForm loginHook={loginHook} />
            <p className="switch-text" onClick={() => switchPage(true)}>
              Não tem conta? Ir para registro
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthPage;
