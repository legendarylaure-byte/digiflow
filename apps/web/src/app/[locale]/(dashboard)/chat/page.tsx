'use client';

import { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  reply: string;
  sources?: string[];
  suggestedActions?: string[];
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hello! I'm DigiFlow AI. I can help you find documents, check workflow status, and answer questions about the system. Try asking:\n\n- \"Where is the IT Budget Proposal?\"\n- \"Show me documents approved by Hari\"\n- \"What's the status of VOM00001?\"",
};

const aiChat = httpsCallable<{ message: string; documentId?: string }, ChatResponse>(functions, 'aiChat');

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await aiChat({ message: input });
      const response: Message = {
        role: 'assistant',
        content: result.data.reply,
      };
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Failed to get response'}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
        <p className="text-sm text-gray-500">Ask me anything about your documents</p>
      </div>

      <Card className="flex h-[65vh] flex-col">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-100 p-1.5">
              <Bot className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <CardTitle className="text-sm">DigiFlow AI</CardTitle>
              <p className="text-xs text-gray-500">Powered by Google Gemini</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="rounded-lg bg-brand-100 p-1.5">
                    <Bot className="h-5 w-5 text-brand-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === 'user' && (
                  <div className="rounded-lg bg-gray-200 p-1.5">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="rounded-lg bg-brand-100 p-1.5">
                  <Bot className="h-5 w-5 text-brand-600" />
                </div>
                <div className="rounded-xl bg-gray-100 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </CardContent>
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your documents..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
