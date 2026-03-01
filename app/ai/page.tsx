"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Recommendation {
  title: string;
  author: string;
  reason: string;
}

export default function AIBot() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I've analysed your reading history and found some great picks for you! 📚" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(
          collection(db, "books"),
          where("userId", "==", user.uid),
          where("list", "==", "library")
        );
        const snapshot = await getDocs(q);
        const books = snapshot.docs.map((doc) => doc.data());

        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ books }),
        });
        const data = await res.json();

        if (data.recommendations) {
          const parsed = parseRecommendations(data.recommendations);
          setRecommendations(parsed);
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const parseRecommendations = (text: string): Recommendation[] => {
    const blocks = text.split(/BOOK:/).filter(Boolean);
    return blocks.map((block) => {
      const titleMatch = block.match(/^(.+)/);
      const authorMatch = block.match(/AUTHOR:\s*(.+)/);
      const reasonMatch = block.match(/REASON:\s*(.+)/);
      return {
        title: titleMatch?.[1]?.trim() || "Unknown",
        author: authorMatch?.[1]?.trim() || "Unknown",
        reason: reasonMatch?.[1]?.trim() || "",
      };
    }).filter(b => b.title !== "Unknown");
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ books: [], customPrompt: userMsg }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "ai", text: data.recommendations || "Sorry, I couldn't get a response." }]);
    setChatLoading(false);
  };

  return (
    <div className="flex gap-8 h-full">

      {/* Left - Recommendations */}
      <div className="flex-[3]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">AI Picks for You ✨</h1>
          <p className="text-[#888888] mt-1">Based on your reading history</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#1A1A2E] rounded-2xl p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🤖</p>
            <p className="text-white text-xl font-semibold mb-2">Add some books first!</p>
            <p className="text-[#888888]">Go to Library, add books you've read, and I'll recommend what to read next.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((book, i) => (
              <div key={i} className="bg-[#1A1A2E] rounded-2xl p-5 flex gap-5">
                <div className="w-20 h-28 rounded-xl flex-shrink-0 bg-[#0D0D0D] flex items-center justify-center text-3xl">
                  📖
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{book.title}</h3>
                  <p className="text-[#C9A84C] text-sm mt-1">{book.author}</p>
                  <p className="text-[#888888] text-sm mt-3 italic">"{book.reason}"</p>
                  <button className="mt-4 border border-[#C9A84C] text-[#C9A84C] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#C9A84C] hover:text-black transition-colors">
                    + Add to Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right - Chat */}
      <div className="flex-[2] bg-[#1A1A2E] rounded-2xl p-6 flex flex-col">
        <h2 className="text-white font-semibold text-lg mb-1">Ask me anything ✨</h2>
        <p className="text-[#888888] text-sm mb-6">I'll suggest books based on your taste</p>

        <div className="flex-1 flex flex-col gap-4 mb-6 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 max-w-xs text-sm ${
                msg.role === "ai"
                  ? "bg-[#0D0D0D] text-white rounded-tl-none"
                  : "bg-[#C9A84C22] border border-[#C9A84C33] text-[#C9A84C] rounded-tr-none self-end"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {chatLoading && (
            <div className="bg-[#0D0D0D] rounded-2xl rounded-tl-none p-4 max-w-xs">
              <p className="text-[#888888] text-sm">Thinking... ✨</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="e.g. suggest a short thriller..."
            className="flex-1 bg-[#0D0D0D] text-white placeholder-[#888888] rounded-full px-4 py-3 text-sm border border-[#ffffff11] focus:outline-none focus:border-[#C9A84C]"
          />
          <button
            onClick={sendMessage}
            className="bg-[#C9A84C] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-[#b8963d] transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}