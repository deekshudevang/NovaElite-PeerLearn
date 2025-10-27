import { useState, useRef } from 'react';
import { aiService, ChatMessage } from '@/services/ai.service';
import { Send, Bot, X, Sparkles } from 'lucide-react';

declare global { interface Window { __OPEN_CHATBOT?: (prompt?: string)=>void } }

export default function Chatbot(){
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you find courses, subjects, or peers. What do you want to learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (e?: React.FormEvent)=>{
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const { reply } = await aiService.chat(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 501) {
        setMessages([...next, { role: 'assistant', content: 'PeerLearn AI is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY in server/.env and restart.' }]);
      } else {
        setMessages([...next, { role: 'assistant', content: 'Sorry, I ran into an issue. Try again in a moment.' }]);
      }
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickAsk = async (prompt: string)=>{
    if (loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: prompt } as ChatMessage];
    setMessages(next); setLoading(true);
    try {
      const { reply } = await aiService.chat(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'AI is not configured yet.' }]);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showSummary = async ()=>{
    if (loading) return;
    setLoading(true);
    try {
      const { overview, endpoints } = await aiService.summary();
      const text = `API overview: users=${overview.users}, profiles=${overview.profiles}, subjects=${overview.subjects}, courses=${overview.courses}, requests=${overview.requests}\nEndpoints:\n- ${endpoints.join('\n- ')}`;
      setMessages(prev=> [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev=> [...prev, { role: 'assistant', content: 'Could not load API summary.' }]);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // expose open function
  window.__OPEN_CHATBOT = (prompt?: string)=>{ setOpen(true); if (prompt) setInput(prompt); };

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {!open ? (
        <button onClick={()=>setOpen(true)} className="rounded-full p-4 shadow-xl bg-gradient-to-br from-primary to-secondary text-white">
          <Bot className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-[360px] h-[520px] bg-card border rounded-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2"><Bot className="w-4 h-4" /><span className="font-semibold">PeerLearn AI</span></div>
            <button onClick={()=>setOpen(false)} className="p-1 hover:opacity-80"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-3 pt-2 border-b">
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>quickAsk('Recommend courses in Development')} className="text-xs px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20">Recommend courses</button>
              <button onClick={()=>quickAsk('List endpoints')} className="text-xs px-2 py-1 rounded-full bg-secondary/10 hover:bg-secondary/20">List endpoints</button>
              <button onClick={showSummary} className="text-xs px-2 py-1 rounded-full bg-accent/10 hover:bg-accent/20 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> API summary</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.map((m, i)=> (
              <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left"><div className="inline-block px-3 py-2 text-sm bg-muted rounded-2xl animate-pulse">Thinking…</div></div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="p-3 border-t flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-md border bg-background" placeholder="Ask anything..." value={input} onChange={e=>setInput(e.target.value)} />
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Send className="w-4 h-4" /> Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
