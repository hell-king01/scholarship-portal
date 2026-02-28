import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, ExternalLink, Zap } from 'lucide-react';

interface ChatbotProps {
    userId: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const quickQuestions = [
        "Am I eligible for scholarships?",
        "What documents do I need?",
        "How do I apply?",
        "When is the deadline?",
    ];

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: 'assistant', content: "Hi! I'm your Scholarship Assistant. How can I help you today?" }
            ]);
        }
    }, [messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (message: string) => {
        if (!message.trim()) return;

        const userMsg = { role: 'user', content: message, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/chatbot/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message, contextType: 'general' })
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.reply,
                    actions: data.actions,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-110"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className="w-96 max-h-[600px] h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in duration-200 origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Scholarship AI</h3>
                                <p className="text-xs text-indigo-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Online & Ready to Help
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-600 border border-indigo-100 shadow-sm'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                                        {msg.content}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {msg.actions.map((action: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={action.route}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                                                    >
                                                        {action.label} <ExternalLink size={10} />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl flex gap-2 items-center shadow-sm">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t border-gray-100 shadow-inner">
                        <div className="mb-3 flex flex-wrap gap-2">
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="px-3 py-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 rounded-full text-xs transition-all whitespace-nowrap"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:bg-gray-300 shadow-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
