import { useState, useRef } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    const evtSource = new EventSourcePolyfill("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_name: "gpt2", message: userMsg })
    });

    let botMessage = "";
    evtSource.onmessage = (event) => {
      if (event.data === "FIN") return;
      botMessage += event.data;
      setMessages(prev => [...prev.filter(m => m.role !== "bot_temp"), { role: "bot_temp", text: botMessage }]);
    };

    evtSource.addEventListener("end", () => {
      setMessages(prev => prev.map(m => m.role === "bot_temp" ? { role: "bot", text: m.text } : m));
      evtSource.close();
    });

    evtSource.addEventListener("error", () => {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Error en la respuesta del modelo." }]);
      evtSource.close();
    });
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", padding: 10, height: 400, overflowY: "auto" }} ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} style={{ color: m.role.startsWith("user") ? "blue" : "green", whiteSpace: "pre-wrap", margin: "5px 0" }}>
            {m.text}
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} style={{ width: "80%", padding: 5 }} />
      <button onClick={sendMessage} style={{ padding: 5 }}>Enviar</button>
    </div>
  );
}

// Polyfill EventSource POST
function EventSourcePolyfill(url, options) {
  fetch(url, options); // POST request
  return new EventSource(url + "?_method=POST"); // workaround SSE
}
