"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserBook {
  title: string;
  author: string;
  genre: string;
  list: string;
  status: string;
  year: string;
  cover: string;
}

interface RadarBook {
  title: string;
  author: string;
  cover: string;
  year: number;
  genre: string;
}

// Curated classics — guaranteed to have covers
const CLASSICS: RadarBook[] = [
  { title: "To Kill a Mockingbird", author: "Harper Lee", cover: "https://covers.openlibrary.org/b/id/8810494-M.jpg", year: 1960, genre: "Fiction" },
  { title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-M.jpg", year: 1949, genre: "Fiction" },
  { title: "Pride and Prejudice", author: "Jane Austen", cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg", year: 1813, genre: "Romance" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover: "https://covers.openlibrary.org/b/id/7222246-M.jpg", year: 1925, genre: "Fiction" },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", cover: "https://covers.openlibrary.org/b/id/8294329-M.jpg", year: 1967, genre: "Fiction" },
  { title: "The Alchemist", author: "Paulo Coelho", cover: "https://covers.openlibrary.org/b/id/8479867-M.jpg", year: 1988, genre: "Fiction" },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", cover: "https://covers.openlibrary.org/b/id/8753960-M.jpg", year: 1866, genre: "Fiction" },
  { title: "Brave New World", author: "Aldous Huxley", cover: "https://covers.openlibrary.org/b/id/8257272-M.jpg", year: 1932, genre: "Fiction" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", cover: "https://covers.openlibrary.org/b/id/8231432-M.jpg", year: 1951, genre: "Fiction" },
  { title: "Anna Karenina", author: "Leo Tolstoy", cover: "https://covers.openlibrary.org/b/id/8297346-M.jpg", year: 1878, genre: "Fiction" },
  { title: "Don Quixote", author: "Miguel de Cervantes", cover: "https://covers.openlibrary.org/b/id/8474036-M.jpg", year: 1605, genre: "Fiction" },
  { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", cover: "https://covers.openlibrary.org/b/id/8946360-M.jpg", year: 1880, genre: "Fiction" },
];

export default function ReadRadar() {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [trending, setTrending] = useState<RadarBook[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDocs(query(collection(db, "books"), where("userId", "==", user.uid)));
        const books = snap.docs.map((d) => d.data() as UserBook);
        setUserBooks(books);
        setAdded(new Set(books.map((b) => b.title.toLowerCase())));
      }
      setPageLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch("https://openlibrary.org/trending/daily.json?limit=30")
      .then((r) => r.json())
      .then((data) => {
        const books: RadarBook[] = (data.works || [])
          .filter((item: any) => item.cover_id && (item.first_publish_year || 0) >= 2000)
          .slice(0, 12)
          .map((item: any) => ({
            title: item.title,
            author: item.authors?.[0]?.name || "Unknown",
            cover: `https://covers.openlibrary.org/b/id/${item.cover_id}-M.jpg`,
            year: item.first_publish_year || 0,
            genre: "Fiction",
          }));
        setTrending(books);
        setTrendingLoading(false);
      })
      .catch(() => setTrendingLoading(false));
  }, []);

  const handleAdd = async (book: RadarBook, list: "library" | "wishlist") => {
    const user = auth.currentUser;
    if (!user) return;
    setAdding(book.title);
    try {
      await addDoc(collection(db, "books"), {
        ...book,
        year: book.year.toString(),
        userId: user.uid,
        list,
        status: list === "library" ? "currently_reading" : "",
        dateAdded: new Date(),
        entryMethod: "readradar",
      });
      setAdded((prev) => new Set([...prev, book.title.toLowerCase()]));
    } catch (e) {}
    setAdding("");
  };

  const BookCard = ({ book }: { book: RadarBook }) => {
    const isAdded = added.has(book.title.toLowerCase());
    const [hover, setHover] = useState(false);
    return (
      <div
        className="relative flex-shrink-0 w-32 cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="w-32 h-44 rounded-xl overflow-hidden bg-[#1A1A2E] relative">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          {isAdded && <div className="absolute top-2 right-2 bg-[#C9A84C] text-black text-xs px-1.5 py-0.5 rounded-full font-bold">✓</div>}
          {hover && !isAdded && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-2 p-2">
              <button onClick={() => handleAdd(book, "library")} disabled={adding === book.title} className="w-full bg-[#C9A84C] text-black text-xs font-bold py-1.5 rounded-lg">+ Library</button>
              <button onClick={() => handleAdd(book, "wishlist")} disabled={adding === book.title} className="w-full border border-[#C9A84C] text-[#C9A84C] text-xs font-bold py-1.5 rounded-lg">+ Wishlist</button>
            </div>
          )}
        </div>
        <p className="text-white text-xs font-semibold mt-2 line-clamp-2 leading-tight">{book.title}</p>
        <p className="text-[#888888] text-xs truncate mt-0.5">{book.author}</p>
      </div>
    );
  };

  const SkeletonRow = () => (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {[1,2,3,4,5,6,7,8].map((i) => (
        <div key={i} className="flex-shrink-0">
          <div className="w-32 h-44 rounded-xl bg-[#1A1A2E] animate-pulse" />
          <div className="w-24 h-3 bg-[#1A1A2E] rounded animate-pulse mt-2" />
        </div>
      ))}
    </div>
  );

  const currentlyReading = userBooks.filter((b) => b.status === "currently_reading");
  const classicsFiltered = CLASSICS.filter((b) => !added.has(b.title.toLowerCase()));

  if (pageLoading) return <SkeletonRow />;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">ReadRadar 📡</h1>
        <p className="text-[#888888] mt-1">Discover your next read — hover to add</p>
      </div>

      {currentlyReading.length > 0 && (
        <div className="bg-[#1A1A2E] rounded-2xl p-6 mb-10">
          <h2 className="text-white font-bold text-lg mb-4">📖 Continue Reading</h2>
          <div className="flex gap-6 flex-wrap">
            {currentlyReading.map((book, i) => (
              <div key={i} className="flex gap-4 items-center min-w-64">
                {book.cover ? <img src={book.cover} alt={book.title} className="w-12 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-16 rounded-lg bg-[#0D0D0D] flex items-center justify-center text-xl flex-shrink-0">📖</div>}
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{book.title}</p>
                  <p className="text-[#888888] text-xs">{book.author}</p>
                  <div className="mt-2 w-full bg-[#0D0D0D] rounded-full h-1.5">
                    <div className="bg-[#C9A84C] h-1.5 rounded-full w-2/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">🔥 Trending Now</h2>
        {trendingLoading ? <SkeletonRow /> : (
          <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
            {trending.filter((b) => !added.has(b.title.toLowerCase())).map((book, i) => <BookCard key={i} book={book} />)}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">📜 All Time Famous Books</h2>
        <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {classicsFiltered.map((book, i) => <BookCard key={i} book={book} />)}
        </div>
      </div>
    </div>
  );
}