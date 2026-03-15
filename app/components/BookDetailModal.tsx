"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

interface Book {
  id?: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  year: string;
  status?: string;
  list?: string;
}

interface Props {
  book: Book;
  onClose: () => void;
}

export default function BookDetailModal({ book, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(true);
  const [adding, setAdding] = useState("");
  const [alreadyIn, setAlreadyIn] = useState<string | null>(null);

  useEffect(() => {
    // Check if book is already in user's collection
    const checkOwned = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(
        query(
          collection(db, "books"),
          where("userId", "==", user.uid),
          where("title", "==", book.title)
        )
      );
      if (!snap.empty) {
        setAlreadyIn(snap.docs[0].data().list);
      }
    };
    checkOwned();

    // Fetch description from Open Library
    const fetchDescription = async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&limit=1&fields=key,description,first_sentence`
        );
        const data = await res.json();
        const item = data.docs?.[0];

        if (item?.key) {
          // Fetch full work details
          const workRes = await fetch(`https://openlibrary.org${item.key}.json`);
          const workData = await workRes.json();
          const desc = workData.description;
          if (typeof desc === "string") {
            setDescription(desc);
          } else if (desc?.value) {
            setDescription(desc.value);
          } else if (item.first_sentence?.[0]) {
            setDescription(item.first_sentence[0]);
          } else {
            setDescription("No description available for this book.");
          }
        } else {
          setDescription("No description available for this book.");
        }
      } catch (e) {
        setDescription("Could not load description.");
      }
      setLoadingDesc(false);
    };

    fetchDescription();
  }, [book.title]);

  const handleAdd = async (list: "library" | "wishlist", status: string = "") => {
    const user = auth.currentUser;
    if (!user) return;
    setAdding(list);
    try {
      await addDoc(collection(db, "books"), {
        title: book.title,
        author: book.author,
        cover: book.cover,
        genre: book.genre,
        year: book.year,
        userId: user.uid,
        list,
        status: list === "library" ? "currently_reading" : "",
        dateAdded: new Date(),
      });
      setAlreadyIn(list);
    } catch (e) {}
    setAdding("");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A2E] rounded-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-6 p-8">
          {/* Cover */}
          <div className="flex-shrink-0">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-36 h-52 rounded-xl object-cover shadow-2xl"
              />
            ) : (
              <div className="w-36 h-52 rounded-xl bg-[#0D0D0D] flex items-center justify-center text-5xl">
                📖
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-white leading-tight">{book.title}</h2>
              <button
                onClick={onClose}
                className="text-[#888888] hover:text-white text-xl flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <p className="text-[#C9A84C] font-semibold mt-1">{book.author}</p>

            <div className="flex gap-2 mt-3 flex-wrap">
              {book.genre && (
                <span className="text-xs bg-[#C9A84C22] text-[#C9A84C] px-3 py-1 rounded-full">
                  {book.genre}
                </span>
              )}
              {book.year && (
                <span className="text-xs bg-[#ffffff11] text-[#888888] px-3 py-1 rounded-full">
                  {book.year}
                </span>
              )}
              {alreadyIn && (
                <span className="text-xs bg-green-900 text-green-400 px-3 py-1 rounded-full">
                  ✓ In your {alreadyIn}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-4">
              {loadingDesc ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full h-3 bg-[#ffffff11] rounded animate-pulse" />
                  <div className="w-full h-3 bg-[#ffffff11] rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-[#ffffff11] rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-[#aaaaaa] text-sm leading-relaxed line-clamp-6">
                  {description}
                </p>
              )}
            </div>

            {/* Add buttons */}
            {!alreadyIn && (
  <div className="flex flex-col gap-2 mt-6">
    <div className="flex gap-3">
      <button
        onClick={() => handleAdd("library", "currently_reading")}
        disabled={!!adding}
        className="flex-1 bg-[#C9A84C] text-black font-bold py-2.5 rounded-full hover:bg-[#b8963d] transition text-sm"
      >
        {adding === "currently_reading" ? "Adding..." : "📖 Currently Reading"}
      </button>
      <button
        onClick={() => handleAdd("library", "already_read")}
        disabled={!!adding}
        className="flex-1 bg-[#C9A84C22] text-[#C9A84C] font-bold py-2.5 rounded-full hover:bg-[#C9A84C33] transition text-sm"
      >
        {adding === "already_read" ? "Adding..." : "✓ Already Read"}
      </button>
    </div>
    <button
      onClick={() => handleAdd("wishlist", "")}
      disabled={!!adding}
      className="w-full border border-[#C9A84C] text-[#C9A84C] font-bold py-2.5 rounded-full hover:bg-[#C9A84C22] transition text-sm"
    >
      {adding === "wishlist" ? "Adding..." : "🔖 Add to Wishlist"}
    </button>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
}