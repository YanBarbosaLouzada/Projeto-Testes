import React, { useRef } from 'react'
import { io } from 'socket.io-client'
import "./Join.css"

function Join({setSocket, setChatVisible}) {
  const usernameRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const username = usernameRef.current?.value
    if(!username?.trim()) return
    try {
        const socket = io("http://localhost:8080/")
        socket.emit("set_username", username)
        setSocket(socket)
        setChatVisible(true)

    } catch (error) {
        console.error(error)
    }
  }
  return (
    <div className="join-container">
      <h1>Coloque um nome para continuar</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" ref={usernameRef} />
        <button type="submit">Continuar</button>
      </form>
    </div>
  );
}

export default Join;