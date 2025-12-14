import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
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
    const [isOpen, setIsOpen] = useState(embedded); // Embedded ise varsayılan açık
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: 'Merhaba! Ben tarım asistanınızım. Size nasıl yardımcı olabilirim?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const city = localStorage.getItem('user_city') || 'Bilinmeyen Konum';

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

    // Render Logic for Embedded Mode
    if (embedded) {
        return (
            <Card className="w-full h-[600px] shadow-sm border border-gray-200 flex flex-col bg-white">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 flex flex-row items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-900">Akıllı Tarım Asistanı</CardTitle>
                        <p className="text-xs text-gray-500">7/24 Sorularınızı Cevaplar</p>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex w-full",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                msg.sender === 'user'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {mutation.isPending && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm text-sm text-gray-500">
                                Yazıyor...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <CardFooter className="p-4 bg-white border-t border-gray-100">
                    <div className="flex w-full gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Örn: Yarın don var mı? Mantar riski nedir?"
                            className="flex-1 text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || mutation.isPending}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all font-medium flex items-center gap-2"
                        >
                            <span>Gönder</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </CardFooter>
            </Card>
        );
    }

    // Existing Popup Mode
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <Card className="absolute bottom-16 right-0 w-80 sm:w-96 shadow-xl border border-gray-200 animate-in slide-in-from-bottom-5 fade-in duration-300 flex flex-col h-[500px] z-50">
                    <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row justify-between items-center rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <CardTitle className="text-base">Tarım Asistanı</CardTitle>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn(
                                "flex w-full",
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                    msg.sender === 'user'
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {mutation.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm text-xs text-gray-500">
                                    ...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t border-gray-100">
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Bir soru sorun..."
                                className="flex-1 text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || mutation.isPending}
                                className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-105",
                    isOpen ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90 text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!isOpen && <span className="hidden md:inline font-medium">Asistana Sor</span>}
            </button>
        </div>
    );
}
