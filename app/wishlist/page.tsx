"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AddBookModal from "../components/AddBookModal";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  status: string;
  list: string;
}

export default function Wishlist() {
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "books"),
          where("userId", "==", user.uid),
          where("list", "==", "wishlist")
        );
        const unsubDb = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Book[];
          setBooks(data);
        });
        return () => unsubDb();
      }
    });
    return () => unsubAuth();
  }, []);

  return (
    <div>
      {showModal && <AddBookModal onClose={() => setShowModal(false)} />}

      {/* Header */}
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

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-6xl mb-4">🔖</p>
          <p className="text-white text-xl font-semibold mb-2">Your wishlist is empty!</p>
          <p className="text-[#888888]">Add books you want to read in the future</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#1f1f3d] transition-colors cursor-pointer group"
            >
              <div className="relative">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-36 rounded-xl mb-3 object-cover" />
                ) : (
                  <div className="w-full h-36 rounded-xl mb-3 bg-[#0D0D0D] flex items-center justify-center text-4xl">📖</div>
                )}
                <div className="absolute top-2 right-2 bg-[#C9A84C] text-black text-xs px-2 py-1 rounded-full">
                  🔖
                </div>
              </div>
              <h3 className="text-white font-semibold text-sm truncate">{book.title}</h3>
              <p className="text-[#888888] text-xs mt-1 truncate">{book.author}</p>
              <button className="w-full mt-3 py-2 rounded-full border border-[#C9A84C] text-[#C9A84C] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C9A84C] hover:text-black">
                Move to Library
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}