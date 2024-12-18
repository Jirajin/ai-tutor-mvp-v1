import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { IoSend } from 'react-icons/io5';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";


const App = () => {
  const [message, setMessage] = useState('');
  const [isResponseScreen, setisResponseScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatSession, setChatSession] = useState(null); // Store the chat session
  const chatContainerRef = useRef(null);
  
  const hitRequest = () => {
    if (message) {
      // Show the user's message instantly on the screen
      const newMessages = [
        ...messages,
        { type: 'userMsg', text: message },
      ];
      setMessages(newMessages); // Update the messages state
      setMessage('');
  
      generateResponse(message); // Then, process the response from AI
    } else {
      alert('You must write something...!');
    }
  };
  
  const generateResponse = async (msg) => {
    if (!msg) return;
  
    const genAI = new GoogleGenerativeAI('AIzaSyDuRQmRoxgKMHz2ob23qQTiFOMP4CILFk4');
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "Your name is James. You are an AI Tutor. You are super friendly, you are fun and enthusiastic, you motivate kids to learn and explore new things, you make learning fun, you teach in the most effective system, to make sure your student has learned, you ask questions. Never break the character.",
    });
  
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
  
    // If chatSession doesn't exist, start a new one
    let session = chatSession;
    if (!session) {
      session = model.startChat({
        generationConfig,
      });
      setChatSession(session); // Save the session for future messages
    }
  
    // Add the new message to the chat history
    const result = await session.sendMessage(msg);
    const response = result.response.text(); // Retrieve the response text
  
    // Add AI's response to the messages array after the user message
    const newMessages = [
      ...messages,
      { type: 'userMsg', text: msg },
      { type: 'responseMsg', text: response },
    ];
  
    setMessages(newMessages); // Update the messages state with the new history
    setisResponseScreen(true);
    
  };

   // Auto-scroll to the bottom whenever messages are updated
   useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // This effect will run whenever the 'messages' state changes

  
  const newChat = () => {
    setisResponseScreen(false);
    setMessages([]);
    setChatSession(null); // Reset the chat session
  };
  
  return (
    <div className="container w-screen min-h-screen overflow-x-hidden bg-[#0E0E0E] text-white">
      {isResponseScreen ? (
        <div className="responseScreen h-[80vh]">
          <div className="header flex items-center justify-between px-4 lg:px-[15%] py-5">
            <h2 className="text-2xl">AI TUTOR MVP V1</h2>
            <button
              id="newChatBtn"
              className="bg-[#181818] px-4 py-2 rounded-full text-sm"
              onClick={newChat}
            >
              New Chat
            </button>
          </div>

          <div className="messages px-4 lg:px-[10%]" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.type}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="middle h-[80vh] flex flex-col justify-center items-center">
          <h1 className="text-4xl">AI TUTOR MVP V1</h1>
          <div className="boxes mt-8 flex items-center gap-2"></div>
        </div>
      )}

      <div className="bottom flex flex-col items-center px-4 lg:px-[20%]">
        <div className="inputBox w-full flex items-center px-5 py-3 bg-[#181818] rounded-full">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            placeholder="Write your message here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                hitRequest();
              }
            }}
          />
          {message && (
            <i
              className="text-green-500 text-2xl cursor-pointer"
              onClick={hitRequest}
            >
              <IoSend />
            </i>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-4">
          AssistMe is developed by Mo. Mahdi Farooqui. This AI uses the Gemini API for giving the
          response.
        </p>
      </div>
    </div>
  );
};

export default App;
