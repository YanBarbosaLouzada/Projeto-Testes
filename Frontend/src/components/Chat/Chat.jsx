import React, { useEffect, useRef, useState } from 'react'
import "./Chat.css"

function Chat({socket}) {
    const bottomRef = useRef(null)
    const messageRef = useRef(null)
    const [messageList, setMessageList] = useState([])
    const [inputValue, setInputValue] = useState("")

    // recebe a mensagem do servidor e adiciona na lista de mensagens
    useEffect(() => {
        socket.on("receive_message", (messagemAtual) => {
            setMessageList((mensagensAnteriores) => [...mensagensAnteriores, messagemAtual])
        })
        return () => {
            socket.off("receive_message")
        }
    }, [socket])

    // scroll para o final da lista de mensagens
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messageList])

    // envia a mensagem para o servidor
    const handleSubmit = (e) => {
        e?.preventDefault()
        const newMessage = inputValue
        if(!newMessage?.trim()) return;
        socket.emit("message", newMessage)
        clearInput()
        focusInput()
    }
    const clearInput = () => {
        setInputValue("")
    }
    const focusInput = () => {
        if(messageRef.current) {
            messageRef.current.focus()
        }
    }
    const getEnterKey = (e)=>{
        if(e.key === "Enter"){
            handleSubmit()
        }
    }

    // renderiza a lista de mensagens
  return (
    <div className="chat-container">
        <div className="chat-header">
            <h1>Suporte Online</h1>
        </div>
        <div className="chat-body">
            <div className="message-list">
                {messageList.map((message,index ) => (
                    <div key={index} className={`chat-message ${message.authorId === socket.id ?"own-message":"other-message"}`}> 
                        <div><strong>{message.author}</strong></div>
                        <div><p>{message.text}</p></div>  
                    </div>      
                ))}
                <div ref={bottomRef}></div>
            </div>
        </div>
        <form onSubmit={handleSubmit}>
            <input 
                type="text" placeholder="Digite sua mensagem"
                ref={messageRef} onKeyDown={(e)=>getEnterKey(e)} 
                className="Chat-input" value={inputValue} 
                onChange={(e)=>setInputValue(e.target.value)}
             />
            <button type="submit">Enviar Mensagem</button>
        </form>
    </div>
  )
}

export default Chat