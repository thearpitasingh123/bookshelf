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

export default function Library() {
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("currently_reading");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const q = query(
          collection(db, "books"),
          where("userId", "==", user.uid),
          where("list", "==", "library")
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

  const filteredBooks = activeTab === "all"
    ? books
    : books.filter((b) => b.status === activeTab);

  return (
    <div>
      {showModal && <AddBookModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Good evening, Arpita 👋</h1>
          <p className="text-[#888888] mt-1">{books.length} books in your library</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9A84C] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#b8963d] transition-colors"
        >
          + Add Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { label: "Currently Reading", value: "currently_reading" },
          { label: "Already Read", value: "already_read" },
          { label: "All Books", value: "all" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeTab === tab.value
                ? "bg-[#C9A84C] text-black"
                : "bg-[#1A1A2E] text-[#888888] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Books */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-6xl mb-4">📚</p>
          <p className="text-white text-xl font-semibold mb-2">No books here yet!</p>
          <p className="text-[#888888]">Click "+ Add Book" to add your first book</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-[#1A1A2E] rounded-2xl p-4 hover:bg-[#1f1f3d] transition-colors cursor-pointer">
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-full h-36 rounded-xl mb-3 object-cover" />
              ) : (
                <div className="w-full h-36 rounded-xl mb-3 bg-[#0D0D0D] flex items-center justify-center text-4xl">📖</div>
              )}
              <h3 className="text-white font-semibold text-sm truncate">{book.title}</h3>
              <p className="text-[#888888] text-xs mt-1 truncate">{book.author}</p>
              <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-2 py-1 rounded-full mt-2 inline-block">
                {book.status === "currently_reading" ? "Reading" : "Read"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}