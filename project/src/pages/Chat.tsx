import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import { ClipLoader } from "react-spinners"; // ✅ Import spinner

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
  image?: string;
}

export const Chat = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Added loading state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://leafcareai.vercel.app/backend/get_chat_messages/${sessionId}/`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false); // ✅ Stop loading after fetch
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotThinking(true);

    try {
      const response = await fetch(`https://leafcareai.vercel.app/backend/send_message/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: input,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setMessages((prev) => [...prev, data.ai_message]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsBotThinking(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="chat-container">
        {loading ? (
          <div className="loading-container">
            <ClipLoader size={50} color={"--navbar-bg"} loading={loading} />
          </div>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      table: ({ children }) => <div className="table-container">{children}</div>,
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="message-link">
                          {props.children}
                        </a>
                      ),
                      code: ({ node, children, ...props }) => {
                        const text = String(children).trim();
                        if (/^https?:\/\//.test(text)) {
                          return (
                            <a href={text} target="_blank" rel="noopener noreferrer" className="message-link">
                              {text}
                            </a>
                          );
                        }
                        return <code {...props}>{children}</code>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {message.image && (
                  <img
                    src={message.image}
                    alt="Predicted Leaf Disease"
                    className="chat-image"
                  />
                )}
              </div>
            ))}

            {isBotThinking && (
              <div className="message">
                <div className="message-content typing">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="form-input"
          />
          <button type="submit" className="button">
            <Send />
          </button>
        </div>
      </form>
    </div>
  );
};
