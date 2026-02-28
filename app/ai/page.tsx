export default function AIBot() {
  const recommendations = [
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      genre: "Finance",
      reason: "Because you loved Atomic Habits — both focus on building better habits around key life areas.",
      color: "#1A1A2E",
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      genre: "Psychology",
      reason: "Since you enjoyed Sapiens, you'll love this deep dive into how human minds and decisions work.",
      color: "#16213E",
    },
    {
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      genre: "Self-help",
      reason: "A perfect next read after Deep Work — practical, no-nonsense life advice.",
      color: "#0F3460",
    },
  ];

  return (
    <div className="flex gap-8 h-full">

      {/* Left column - Recommendations */}
      <div className="flex-[3]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">AI Picks for You ✨</h1>
          <p className="text-[#888888] mt-1">Based on 4 books you've already read</p>
        </div>

        <div className="flex flex-col gap-4">
          {recommendations.map((book, i) => (
            <div key={i} className="bg-[#1A1A2E] rounded-2xl p-5 flex gap-5 hover:bg-[#1f1f3d] transition-colors">
              {/* Book cover */}
              <div
                className="w-20 h-28 rounded-xl flex-shrink-0"
                style={{ backgroundColor: book.color, boxShadow: "0 0 15px #C9A84C33" }}
              />

              {/* Book info */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{book.title}</h3>
                      <p className="text-[#C9A84C] text-sm mt-1">{book.author}</p>
                    </div>
                    <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-3 py-1 rounded-full">
                      {book.genre}
                    </span>
                  </div>
                  <p className="text-[#888888] text-sm mt-3 italic">"{book.reason}"</p>
                </div>

                <button className="mt-4 self-start border border-[#C9A84C] text-[#C9A84C] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#C9A84C] hover:text-black transition-colors">
                  + Add to Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 text-[#C9A84C] text-sm hover:underline">
          🔄 Refresh Picks
        </button>
      </div>

      {/* Right column - Chat */}
      <div className="flex-[2] bg-[#1A1A2E] rounded-2xl p-6 flex flex-col">
        <h2 className="text-white font-semibold text-lg mb-1">Ask me anything ✨</h2>
        <p className="text-[#888888] text-sm mb-6">I'll suggest books based on your taste</p>

        {/* Chat messages */}
        <div className="flex-1 flex flex-col gap-4 mb-6">
          <div className="bg-[#0D0D0D] rounded-2xl rounded-tl-none p-4 max-w-xs">
            <p className="text-white text-sm">Based on your reading history, here are my top picks! Want me to narrow it down? 📚</p>
          </div>
          <div className="bg-[#C9A84C22] border border-[#C9A84C33] rounded-2xl rounded-tr-none p-4 max-w-xs self-end">
            <p className="text-[#C9A84C] text-sm">Suggest something shorter please!</p>
          </div>
          <div className="bg-[#0D0D0D] rounded-2xl rounded-tl-none p-4 max-w-xs">
            <p className="text-white text-sm">Sure! Try "The Alchemist" by Paulo Coelho — a short, magical read perfect for a weekend. ✨</p>
          </div>
        </div>

        {/* Chat input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. suggest a short thriller..."
            className="flex-1 bg-[#0D0D0D] text-white placeholder-[#888888] rounded-full px-4 py-3 text-sm border border-[#ffffff11] focus:outline-none focus:border-[#C9A84C]"
          />
          <button className="bg-[#C9A84C] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-[#b8963d] transition-colors">
            →
          </button>
        </div>
      </div>

    </div>
  );
}