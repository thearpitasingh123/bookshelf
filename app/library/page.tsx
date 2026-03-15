"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AddBookModal from "../components/AddBookModal";
import BookDetailModal from "../components/BookDetailModal";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  status: string;
  list: string;
  year: string;
}

export default function Library() {
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState("currently_reading");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "books"),
          where("userId", "==", user.uid),
          where("list", "==", "library")
        );
        const unsubDb = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Book[];
          setBooks(data.sort((a, b) => a.title.localeCompare(b.title)));
        });
        return () => unsubDb();
      }
    });
    return () => unsubAuth();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "books", id), { status });
  };

  const moveToWishlist = async (id: string) => {
    await updateDoc(doc(db, "books", id), { list: "wishlist", status: "" });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "books", id));
    if (selectedBook?.id === id) setSelectedBook(null);
  };

  const filteredBooks = activeTab === "all" ? books : books.filter((b) => b.status === activeTab);

  return (
    <div>
      {showModal && <AddBookModal onClose={() => setShowModal(false)} />}
      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Library 📚</h1>
          <p className="text-[#888888] mt-1">{books.length} books in your library</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors"
        >
          + Add Book
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        {[
          { label: "Currently Reading", value: "currently_reading" },
          { label: "Already Read", value: "already_read" },
          { label: "Have But Not Read", value: "have_not_read" },
          { label: "All Books", value: "all" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeTab === tab.value ? "bg-[#C9A84C] text-black" : "bg-[#1A1A2E] text-[#888888] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-6xl mb-4">📚</p>
          <p className="text-white text-xl font-semibold mb-2">No books here yet!</p>
          <p className="text-[#888888]">Click "+ Add Book" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#1f1f3d] transition-colors">
              <div
                className="cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-48 rounded-xl mb-3 object-cover" />
                ) : (
                  <div className="w-full h-48 rounded-xl mb-3 bg-[#0D0D0D] flex items-center justify-center text-4xl">📖</div>
                )}
                <h3 className="text-white font-semibold text-sm truncate">{book.title}</h3>
                <p className="text-[#888888] text-xs mt-1 truncate">{book.author}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full">
                    {book.genre || "General"}
                  </span>
                  <span className="text-xs text-[#888888]">
                    {book.status === "currently_reading" ? "📖" : book.status === "have_not_read" ? "📦" : "✓"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-3">
                {book.status === "currently_reading" && (
                  <>
                    <button
                      onClick={() => updateStatus(book.id, "already_read")}
                      className="w-full bg-[#C9A84C] text-black text-xs font-semibold py-1.5 rounded-lg hover:bg-[#b8963d] transition"
                    >
                      ✓ Mark as Read
                    </button>
                    <button
                      onClick={() => updateStatus(book.id, "have_not_read")}
                      className="w-full bg-[#ffffff11] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#ffffff22] transition"
                    >
                      📦 Move to Have It
                    </button>
                  </>
                )}

                {book.status === "already_read" && (
                  <>
                    <button
                      onClick={() => updateStatus(book.id, "currently_reading")}
                      className="w-full bg-[#C9A84C22] text-[#C9A84C] text-xs font-semibold py-1.5 rounded-lg hover:bg-[#C9A84C33] transition"
                    >
                      📖 Mark as Reading
                    </button>
                    <button
                      onClick={() => updateStatus(book.id, "have_not_read")}
                      className="w-full bg-[#ffffff11] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#ffffff22] transition"
                    >
                      📦 Move to Have It
                    </button>
                  </>
                )}

                {book.status === "have_not_read" && (
                  <>
                    <button
                      onClick={() => updateStatus(book.id, "currently_reading")}
                      className="w-full bg-[#C9A84C] text-black text-xs font-semibold py-1.5 rounded-lg hover:bg-[#b8963d] transition"
                    >
                      📖 Start Reading
                    </button>
                    <button
                      onClick={() => updateStatus(book.id, "already_read")}
                      className="w-full bg-[#C9A84C22] text-[#C9A84C] text-xs font-semibold py-1.5 rounded-lg hover:bg-[#C9A84C33] transition"
                    >
                      ✓ Mark as Read
                    </button>
                  </>
                )}

                <button
                  onClick={() => moveToWishlist(book.id)}
                  className="w-full bg-[#ffffff08] text-[#888888] text-xs font-semibold py-1.5 rounded-lg hover:bg-[#ffffff11] transition"
                >
                  🔖 Move to Wishlist
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="w-full bg-red-900 text-red-400 text-xs font-semibold py-1.5 rounded-lg hover:bg-red-800 transition"
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}