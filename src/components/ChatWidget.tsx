"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; from: "user" | "agent"; text: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        if (!(d.messages || []).length) {
          setMessages([{ id: "hello", from: "agent", text: "Hi! How can we help you?" }]);
        }
      });
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setMessages(data.messages || []);
    setText("");
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((v) => !v)} aria-label="Live chat">
        💬
      </button>
      {open && (
        <div className="chat-box">
          <header>Chat with us</header>
          <div className="msgs">
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
