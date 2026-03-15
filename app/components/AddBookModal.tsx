"use client";
import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

interface Book {
  title: string;
  author: string;
  cover: string;
  isbn: string;
  genre: string;
  year: string;
}

export default function AddBookModal({ onClose }: any) {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState("");

  const searchBooks = async () => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(queryText)}&limit=10`
      );
      const data = await res.json();
      const books = data.docs.map((book: any) => ({
        title: book.title || "Unknown Title",
        author: book.author_name?.[0] || "Unknown Author",
        cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "",
        isbn: book.isbn?.[0] || "",
        genre: book.subject?.[0] || "Fiction",
        year: book.first_publish_year?.toString() || "",
      }));
      setResults(books);
    } catch (e) {
      console.error("Search failed", e);
    }
    setLoading(false);
  };

  const addBook = async (book: Book, list: string, status?: string) => {
    const user = auth.currentUser;
    if (!user) return;
    setAdding(book.title + (status || list));

    const snapshot = await getDocs(
      query(
        collection(db, "books"),
        where("userId", "==", user.uid),
        where("title", "==", book.title)
      )
    );

    if (!snapshot.empty) {
      alert("Book already exists in your collection!");
      setAdding("");
      return;
    }

    await addDoc(collection(db, "books"), {
      ...book,
      userId: user.uid,
      list,
      status: status || "",
      dateAdded: new Date(),
    });

    alert(`"${book.title}" added!`);
    setAdding("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A1A2E] p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add a Book</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white text-2xl">✕</button>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
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

        {/* Results — scrollable */}
        <div
          className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#C9A84C #0D0D0D" }}
        >
          {results.length === 0 && !loading && (
            <p className="text-[#888888] text-center py-8">
              Search for a book to get started 📚
            </p>
          )}

          {results.map((book, i) => (
            <div key={i} className="flex gap-4 bg-[#0D0D0D] rounded-xl p-4 items-center">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-14 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-20 rounded-lg bg-[#1A1A2E] flex-shrink-0 flex items-center justify-center text-2xl">
                  📖
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{book.title}</h3>
                <p className="text-[#888888] text-sm">{book.author}</p>
                {book.year && (
                  <p className="text-[#888888] text-xs mt-0.5">{book.year}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => addBook(book, "library", "currently_reading")}
                  disabled={adding === book.title + "currently_reading"}
                  className="text-xs bg-[#C9A84C] text-black font-semibold px-3 py-1.5 rounded-full hover:bg-[#b8963d] transition-colors whitespace-nowrap"
                >
                  📖 Reading
                </button>
                <button
                  onClick={() => addBook(book, "library", "already_read")}
                  disabled={adding === book.title + "already_read"}
                  className="text-xs bg-[#C9A84C22] text-[#C9A84C] font-semibold px-3 py-1.5 rounded-full hover:bg-[#C9A84C33] transition-colors whitespace-nowrap"
                >
                  ✓ Already Read
                </button>
                <button
                  onClick={() => addBook(book, "library", "have_not_read")}
                  disabled={adding === book.title + "have_not_read"}
                  className="text-xs bg-[#ffffff11] text-white font-semibold px-3 py-1.5 rounded-full hover:bg-[#ffffff22] transition-colors whitespace-nowrap"
                >
                  📦 Have It
                </button>
                <button
                  onClick={() => addBook(book, "wishlist")}
                  disabled={adding === book.title + "wishlist"}
                  className="text-xs border border-[#ffffff22] text-[#888888] font-semibold px-3 py-1.5 rounded-full hover:bg-[#ffffff11] transition-colors whitespace-nowrap"
                >
                  🔖 Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}