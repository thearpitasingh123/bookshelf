"use client";
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

interface Book {
  title: string;
  author: string;
  cover: string;
  isbn: string;
  genre: string;
  year: string;
}

interface Props {
  onClose: () => void;
}

export default function AddBookModal({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState("");

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      const books = data.docs.map((book: any) => ({
        title: book.title || "Unknown Title",
        author: book.author_name?.[0] || "Unknown Author",
        cover: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "",
        isbn: book.isbn?.[0] || "",
        genre: book.subject?.[0] || "General",
        year: book.first_publish_year?.toString() || "",
      }));
      setResults(books);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  const addBook = async (book: Book, list: string, status?: string) => {
    const user = auth.currentUser;
    if (!user) return;
    setAdding(book.title);
    try {
      await addDoc(collection(db, "books"), {
        ...book,
        userId: user.uid,
        list,
        status: status || "",
        dateAdded: new Date(),
        entryMethod: "api",
      });
      alert(`"${book.title}" added to your ${list}!`);
    } catch (error) {
      console.error("Failed to add book:", error);
    }
    setAdding("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1A1A2E] rounded-2xl p-8 w-full max-w-2xl mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add a Book</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white text-2xl">✕</button>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchBooks()}
            placeholder="Search by title or author..."
            className="flex-1 bg-[#0D0D0D] text-white placeholder-[#888888] rounded-full px-5 py-3 border border-[#ffffff11] focus:outline-none focus:border-[#C9A84C]"
          />
          <button
            onClick={searchBooks}
            className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
          {results.length === 0 && !loading && (
            <p className="text-[#888888] text-center py-8">
              Search for a book to get started 📚
            </p>
          )}
          {results.map((book, i) => (
            <div key={i} className="flex gap-4 bg-[#0D0D0D] rounded-xl p-4 items-center">
              {/* Cover */}
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-12 h-16 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-16 rounded bg-[#1A1A2E] flex-shrink-0 flex items-center justify-center text-2xl">📖</div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{book.title}</h3>
                <p className="text-[#888888] text-sm">{book.author}</p>
                {book.year && <p className="text-[#888888] text-xs">{book.year}</p>}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => addBook(book, "library", "currently_reading")}
                  disabled={adding === book.title}
                  className="text-xs bg-[#C9A84C] text-black font-semibold px-3 py-1 rounded-full hover:bg-[#b8963d] transition-colors"
                >
                  + Library
                </button>
                <button
                  onClick={() => addBook(book, "wishlist")}
                  disabled={adding === book.title}
                  className="text-xs border border-[#C9A84C] text-[#C9A84C] font-semibold px-3 py-2 rounded-full hover:bg-[#C9A84C] hover:text-black transition-colors"
                >
                  + Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}