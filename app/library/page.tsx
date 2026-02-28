export default function Library() {
  const books = [
    { title: "Atomic Habits", author: "James Clear", genre: "Self-help", status: "already_read", color: "#1A1A2E" },
    { title: "Sapiens", author: "Yuval Noah Harari", genre: "History", status: "already_read", color: "#16213E" },
    { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", status: "currently_reading", color: "#0F3460" },
    { title: "Deep Work", author: "Cal Newport", genre: "Self-help", status: "currently_reading", color: "#2D1B69" },
    { title: "1984", author: "George Orwell", genre: "Fiction", status: "already_read", color: "#1A1A2E" },
    { title: "Think Fast & Slow", author: "Daniel Kahneman", genre: "Psychology", status: "already_read", color: "#16213E" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Good evening, Arpita 👋</h1>
          <p className="text-[#888888] mt-1">Here's your reading life</p>
        </div>
        <button className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors">
          + Add Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {["Currently Reading", "Already Read", "All Books"].map((tab, i) => (
          <button
            key={i}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              i === 0
                ? "bg-[#C9A84C] text-black"
                : "bg-[#1A1A2E] text-[#888888] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Currently Reading */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[#888888] mb-4">CURRENTLY READING</h2>
        <div className="flex gap-4">
          {books.filter(b => b.status === "currently_reading").map((book, i) => (
            <div key={i} className="flex gap-4 bg-[#1A1A2E] rounded-2xl p-4 flex-1">
              <div className="w-16 h-24 rounded-lg flex-shrink-0" style={{ backgroundColor: book.color, boxShadow: "0 0 15px #C9A84C33" }} />
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-semibold">{book.title}</h3>
                  <p className="text-[#888888] text-sm">{book.author}</p>
                  <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full mt-2 inline-block">{book.genre}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1 bg-[#ffffff11] rounded-full">
                    <div className="h-1 bg-[#C9A84C] rounded-full" style={{ width: "40%" }} />
                  </div>
                  <p className="text-[#888888] text-xs mt-1">In progress</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Already Read */}
      <div>
        <h2 className="text-lg font-semibold text-[#888888] mb-4">ALREADY READ</h2>
        <div className="grid grid-cols-4 gap-4">
          {books.filter(b => b.status === "already_read").map((book, i) => (
            <div key={i} className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#1f1f3d] transition-colors cursor-pointer">
              <div className="w-full h-36 rounded-xl mb-3" style={{ backgroundColor: book.color, boxShadow: "0 0 15px #C9A84C22" }} />
              <h3 className="text-white font-semibold text-sm">{book.title}</h3>
              <p className="text-[#888888] text-xs mt-1">{book.author}</p>
              <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full mt-2 inline-block">{book.genre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}