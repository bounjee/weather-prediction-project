
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { sendMessage } from '../services/api';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
}

interface ChatWidgetProps {
    embedded?: boolean;
}

export default function ChatWidget({ embedded = false }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(embedded);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: 'Merhaba! Ben ekinleriniz ve hava durumu hakkında yardımcı olmaya hazırım.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Use the stored city or default to Ankara
    const city = localStorage.getItem('user_city') || 'Ankara';

    const mutation = useMutation({
        mutationFn: (text: string) => sendMessage(text, city),
        onSuccess: (data) => {
            setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'bot', text: data }]);
        },
        onError: () => {
            setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Üzgünüm, şu an bağlantıda bir sorun var.' }]);
        }
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
        setMessages((prev) => [...prev, userMsg]);
        mutation.mutate(inputValue);
        setInputValue('');
    };

    if (embedded) {
        return (
            <Card className="w-full h-[600px] shadow-sm border border-stone-100 flex flex-col bg-white overflow-hidden rounded-[22px]">
                <CardHeader className="bg-[#F8FAF9] border-b border-stone-100 p-6 flex flex-row items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                        <Bot className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-stone-800">Agro Asistan</CardTitle>
                        <p className="text-xs text-stone-500 font-medium">7/24 Teknik Destek</p>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FCFDFD]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex w-full animate-in slide-in-from-bottom-2 duration-300",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm",
                                msg.sender === 'user'
                                    ? "bg-green-600 text-white rounded-br-none"
                                    : "bg-white border border-stone-100 text-stone-700 rounded-bl-none shadow-stone-100"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {mutation.isPending && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm text-sm text-stone-400">
                                Yanıt oluşturuluyor...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <CardFooter className="p-4 bg-white border-t border-stone-50">
                    <div className="flex w-full gap-3 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Örn: Bu hafta yağmur var mı?"
                            className="flex-1 text-sm pl-4 pr-12 py-4 rounded-xl border border-stone-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all bg-stone-50 focus:bg-white text-stone-700 placeholder:text-stone-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || mutation.isPending}
                            className="absolute right-2 top-2 bottom-2 bg-green-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-all shadow-md shadow-green-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            {isOpen && (
                <Card className="absolute bottom-20 right-0 w-80 sm:w-96 shadow-2xl border border-stone-200 animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col h-[500px] z-50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-[#F8FAF9] p-4 flex flex-row justify-between items-center border-b border-stone-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100/50 rounded-xl">
                                <Bot className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-stone-800">Agro Asistan</CardTitle>
                                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Çevrimiçi
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin scrollbar-thumb-stone-200">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn(
                                "flex w-full text-sm",
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-green-600 text-white rounded-br-none"
                                        : "bg-stone-50 border border-stone-100 text-stone-700 rounded-bl-none"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {mutation.isPending && (
                            <div className="flex justify-start">
                                <span className="text-xs text-stone-400 ml-4 animate-pulse">Yazıyor...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t border-stone-100">
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Soru sor..."
                                className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-stone-50 focus:bg-white transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || mutation.isPending}
                                className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 hover:shadow-lg hover:shadow-green-600/20 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-2xl shadow-xl shadow-green-900/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95",
                    isOpen
                        ? "bg-stone-800 text-white rotate-90"
                        : "bg-gradient-to-br from-green-600 to-emerald-600 text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </button>
        </div>
    );
}
