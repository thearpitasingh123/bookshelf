export default function Wishlist() {
  const books = [
    { title: "The Psychology of Money", author: "Morgan Housel", genre: "Finance", color: "#1A1A2E" },
    { title: "Ikigai", author: "Héctor García", genre: "Self-help", color: "#16213E" },
    { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", color: "#0F3460" },
    { title: "Educated", author: "Tara Westover", genre: "Memoir", color: "#2D1B69" },
    { title: "Project Hail Mary", author: "Andy Weir", genre: "Sci-Fi", color: "#1A1A2E" },
    { title: "The Power of Now", author: "Eckhart Tolle", genre: "Spirituality", color: "#16213E" },
    { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", color: "#0F3460" },
    { title: "Becoming", author: "Michelle Obama", genre: "Memoir", color: "#2D1B69" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Wishlist 🔖</h1>
          <p className="text-[#888888] mt-1">{books.length} books you want to read</p>
        </div>
        <button className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors">
          + Add Book
        </button>
      </div>

      {/* Filter row */}
      <div className="flex gap-3 mb-8">
        <select className="bg-[#1A1A2E] text-[#888888] border border-[#ffffff11] rounded-full px-4 py-2 text-sm">
          <option>All Genres</option>
          <option>Fiction</option>
          <option>Self-help</option>
          <option>Sci-Fi</option>
          <option>Memoir</option>
        </select>
        <select className="bg-[#1A1A2E] text-[#888888] border border-[#ffffff11] rounded-full px-4 py-2 text-sm">
          <option>Sort: Date Added</option>
          <option>Sort: Title A-Z</option>
          <option>Sort: Author A-Z</option>
        </select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-4 gap-4">
        {books.map((book, i) => (
          <div
            key={i}
            className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#1f1f3d] transition-colors cursor-pointer group"
          >
            {/* Cover */}
            <div className="relative">
              <div
                className="w-full h-36 rounded-xl mb-3"
                style={{ backgroundColor: book.color, boxShadow: "0 0 15px #C9A84C22" }}
              />
              {/* Bookmark icon */}
              <div className="absolute top-2 right-2 bg-[#C9A84C] text-black text-xs px-2 py-1 rounded-full">
                🔖
              </div>
            </div>

            <h3 className="text-white font-semibold text-sm">{book.title}</h3>
            <p className="text-[#888888] text-xs mt-1">{book.author}</p>
            <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full mt-2 inline-block">
              {book.genre}
            </span>

            {/* Move to Library button - shows on hover */}
            <button className="w-full mt-3 py-2 rounded-full border border-[#C9A84C] text-[#C9A84C] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C9A84C] hover:text-black">
              Move to Library
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}