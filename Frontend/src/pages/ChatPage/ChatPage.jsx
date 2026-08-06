import React, { useState } from 'react'
import Chat from '../../components/Chat/Chat'
import Join from '../../components/Join/Join'
import "./ChatPage.css"

function ChatPage() {
  const [chatVisible, setChatVisible] = useState(false);
  const [socket, setSocket] = useState(null);
  return (
    <div className="chat-page">
        {chatVisible ? <Chat socket={socket} /> : <Join setSocket={setSocket} setChatVisible={setChatVisible} />}
    </div>
  )
}

export default ChatPage