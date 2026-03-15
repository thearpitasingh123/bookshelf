"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import AddBookModal from "../components/AddBookModal";
import BookDetailModal from "../components/BookDetailModal";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  year: string;
  status: string;
  list: string;
}

export default function Wishlist() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const q = query(
        collection(db, "books"),
        where("userId", "==", user.uid),
        where("list", "==", "wishlist")
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Book[];
setBooks(data.sort((a, b) => a.title.localeCompare(b.title)));
      });
    });
    return () => unsub();
  }, []);

  const moveToLibrary = async (id: string, status: string) => {
    await updateDoc(doc(db, "books", id), { list: "library", status });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "books", id));
    if (selectedBook?.id === id) setSelectedBook(null);
  };

  return (
    <div>
      {showModal && <AddBookModal onClose={() => setShowModal(false)} />}
      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Wishlist 🔖</h1>
          <p className="text-[#888888] mt-1">{books.length} books you want to read</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors"
        >
          + Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-6xl mb-4">🔖</p>
          <p className="text-white text-xl font-semibold mb-2">Your wishlist is empty!</p>
          <p className="text-[#888888]">Add books you want to read in the future</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-[#1A1A2E] p-4 rounded-2xl hover:bg-[#1f1f3d] transition-colors">
              <div
                className="cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-48 rounded-xl mb-3 object-contain bg-[#0D0D0D]" />
                ) : (
                  <div className="w-full h-48 rounded-xl mb-3 bg-[#0D0D0D] flex items-center justify-center text-4xl">📖</div>
                )}
                <h3 className="text-white font-semibold text-sm truncate">{book.title}</h3>
                <p className="text-[#888888] text-xs mt-1 truncate">{book.author}</p>
                {book.genre && (
                  <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full mt-2 inline-block">
                    {book.genre}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-3">
                <button
                  onClick={() => moveToLibrary(book.id, "currently_reading")}
                  className="w-full bg-[#C9A84C] text-black text-xs font-semibold py-1.5 rounded-lg hover:bg-[#b8963d] transition"
                >
                  📖 Move to Reading
                </button>
                <button
                  onClick={() => moveToLibrary(book.id, "already_read")}
                  className="w-full bg-[#C9A84C22] text-[#C9A84C] text-xs font-semibold py-1.5 rounded-lg hover:bg-[#C9A84C33] transition"
                >
                  ✓ Mark as Read
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