'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'agent',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      text: 'I have a question about my recent invoice.',
      sender: 'user',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      text: 'Of course, I\'d be happy to help with that. Could you please provide me with the invoice number or date so I can look it up for you?',
      sender: 'agent',
      timestamp: '10:33 AM'
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for providing that information. I\'m checking your invoice details now.',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, agentResponse]);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <Image
                src="/auth/Agents/agent-03.jpg"
                alt="Agent Profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-medium text-black">Arshir Patel</h2>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-800">
              <Phone size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <Video size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button 
              type="button" 
              className="text-gray-500 hover:text-gray-700"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
              disabled={newMessage.trim() === ''}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
