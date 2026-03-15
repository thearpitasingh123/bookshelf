"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BookDetailModal from "../components/BookDetailModal";

interface Book {
  title: string;
  author: string;
  cover: string;
  genre: string;
  list: string;
  status: string;
  year: string;
}

interface GenreScore {
  genre: string;
  score: number;
}

interface Recommendation {
  title: string;
  author: string;
  year: number;
  genre: string;
  matchScore: number;
  reason: string;
  cover: string;
}

const BOOKS = [
  { title: "It Ends with Us", author: "Colleen Hoover", genre: "Romance", year: 2016 },
  { title: "The Hating Game", author: "Sally Thorne", genre: "Romance", year: 2016 },
  { title: "Beach Read", author: "Emily Henry", genre: "Romance", year: 2020 },
  { title: "People We Meet on Vacation", author: "Emily Henry", genre: "Romance", year: 2021 },
  { title: "The Kiss Quotient", author: "Helen Hoang", genre: "Romance", year: 2018 },
  { title: "Book Lovers", author: "Emily Henry", genre: "Romance", year: 2022 },
  { title: "Things We Never Got Over", author: "Lucy Score", genre: "Romance", year: 2022 },
  { title: "Happy Place", author: "Emily Henry", genre: "Romance", year: 2023 },
  { title: "Icebreaker", author: "Hannah Grace", genre: "Romance", year: 2022 },
  { title: "Funny Story", author: "Emily Henry", genre: "Romance", year: 2024 },
  { title: "The Spanish Love Deception", author: "Elena Armas", genre: "Romance", year: 2021 },
  { title: "In a Holidaze", author: "Christina Lauren", genre: "Romance", year: 2020 },
  { title: "The Love Hypothesis", author: "Ali Hazelwood", genre: "Romance", year: 2021 },
  { title: "Act Your Age, Eve Brown", author: "Talia Hibbert", genre: "Romance", year: 2021 },
  { title: "One Day in December", author: "Josie Silver", genre: "Romance", year: 2018 },
  { title: "The Flatshare", author: "Beth O'Leary", genre: "Romance", year: 2019 },
  { title: "Red, White & Royal Blue", author: "Casey McQuiston", genre: "Romance", year: 2019 },
  { title: "Boyfriend Material", author: "Alexis Hall", genre: "Romance", year: 2020 },
  { title: "One Last Stop", author: "Casey McQuiston", genre: "Romance", year: 2021 },
  { title: "Written in the Stars", author: "Alexandria Bellefleur", genre: "Romance", year: 2020 },
  { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", year: 2020 },
  { title: "Lessons in Chemistry", author: "Bonnie Garmus", genre: "Fiction", year: 2022 },
  { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", genre: "Fiction", year: 2022 },
  { title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction", year: 2003 },
  { title: "A Little Life", author: "Hanya Yanagihara", genre: "Fiction", year: 2015 },
  { title: "Normal People", author: "Sally Rooney", genre: "Fiction", year: 2018 },
  { title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Fiction", year: 2018 },
  { title: "The Vanishing Half", author: "Brit Bennett", genre: "Fiction", year: 2020 },
  { title: "Piranesi", author: "Susanna Clarke", genre: "Fiction", year: 2020 },
  { title: "Babel", author: "R.F. Kuang", genre: "Fiction", year: 2022 },
  { title: "Yellowface", author: "R.F. Kuang", genre: "Fiction", year: 2023 },
  { title: "The Secret History", author: "Donna Tartt", genre: "Fiction", year: 1992 },
  { title: "Intermezzo", author: "Sally Rooney", genre: "Fiction", year: 2024 },
  { title: "Atomic Habits", author: "James Clear", genre: "Self-help", year: 2018 },
  { title: "Think Again", author: "Adam Grant", genre: "Self-help", year: 2021 },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", genre: "Self-help", year: 2016 },
  { title: "Deep Work", author: "Cal Newport", genre: "Self-help", year: 2016 },
  { title: "Four Thousand Weeks", author: "Oliver Burkeman", genre: "Self-help", year: 2021 },
  { title: "The Psychology of Money", author: "Morgan Housel", genre: "Self-help", year: 2020 },
  { title: "Never Finished", author: "David Goggins", genre: "Self-help", year: 2022 },
  { title: "Ikigai", author: "Héctor García", genre: "Self-help", year: 2016 },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Psychology", year: 2011 },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk", genre: "Psychology", year: 2014 },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", genre: "Psychology", year: 1946 },
  { title: "Maybe You Should Talk to Someone", author: "Lori Gottlieb", genre: "Psychology", year: 2019 },
  { title: "Lost Connections", author: "Johann Hari", genre: "Psychology", year: 2018 },
  { title: "Sapiens", author: "Yuval Noah Harari", genre: "History", year: 2011 },
  { title: "Homo Deus", author: "Yuval Noah Harari", genre: "History", year: 2015 },
  { title: "Empire of Pain", author: "Patrick Radden Keefe", genre: "History", year: 2021 },
  { title: "Say Nothing", author: "Patrick Radden Keefe", genre: "History", year: 2019 },
  { title: "Educated", author: "Tara Westover", genre: "Biography", year: 2018 },
  { title: "Becoming", author: "Michelle Obama", genre: "Biography", year: 2018 },
  { title: "Open", author: "Andre Agassi", genre: "Biography", year: 2009 },
  { title: "A Court of Thorns and Roses", author: "Sarah J. Maas", genre: "Fantasy", year: 2015 },
  { title: "Fourth Wing", author: "Rebecca Yarros", genre: "Fantasy", year: 2023 },
  { title: "Iron Flame", author: "Rebecca Yarros", genre: "Fantasy", year: 2023 },
  { title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy", year: 2010 },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", year: 2007 },
  { title: "Project Hail Mary", author: "Andy Weir", genre: "Science Fiction", year: 2021 },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", genre: "Science Fiction", year: 2021 },
  { title: "Dune", author: "Frank Herbert", genre: "Science Fiction", year: 1965 },
  { title: "The Hunger Games", author: "Suzanne Collins", genre: "Science Fiction", year: 2008 },
];

export default function AIpicks() {
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [displayed, setDisplayed] = useState<Recommendation[]>([]);
  const [page, setPage] = useState(0);
  const [genreScores, setGenreScores] = useState<GenreScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDocs(
          query(collection(db, "books"), where("userId", "==", user.uid))
        );
        const books = snap.docs.map((doc) => doc.data() as Book);
        setUserBooks(books);
        calculateRecommendations(books);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const start = page * PAGE_SIZE;
    const slice = allRecommendations.slice(start, start + PAGE_SIZE);
    setDisplayed(slice);
    fetchCovers(slice);
  }, [page, allRecommendations]);

  const fetchCovers = async (books: Recommendation[]) => {
    const newCache: Record<string, string> = { ...coverCache };
    const uncached = books.filter((b) => !newCache[b.title]);
    for (let i = 0; i < uncached.length; i += 5) {
      const batch = uncached.slice(i, i + 5);
      await Promise.all(batch.map(async (book) => {
        try {
          const res = await fetch(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&limit=1&fields=cover_i`
          );
          const data = await res.json();
          const coverId = data.docs?.[0]?.cover_i;
          if (coverId) newCache[book.title] = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
        } catch (e) {}
      }));
      setCoverCache({ ...newCache });
    }
  };

  const calculateRecommendations = (books: Book[]) => {
    const scores: Record<string, number> = {};
    books.forEach((book) => {
      const genre = book.genre || "General";
      if (!scores[genre]) scores[genre] = 0;
      scores[genre] += book.list === "library" ? 1 : 0.5;
    });

    const sortedGenres = Object.entries(scores)
      .map(([genre, score]) => ({ genre, score }))
      .sort((a, b) => b.score - a.score);
    setGenreScores(sortedGenres);

    const years = books.map((b) => parseInt(b.year)).filter((y) => !isNaN(y) && y > 0);
    const avgYear = years.length ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : 2020;
    const mostRecentYear = years.length ? Math.max(...years) : 2020;

    const userAuthors = new Set(books.map((b) => b.author?.toLowerCase().trim()));
    const userTitles = new Set(books.map((b) => b.title?.toLowerCase().trim()));
    const maxScore = sortedGenres[0]?.score || 1;

    const scored = BOOKS
      .filter((b) => !userTitles.has(b.title.toLowerCase().trim()))
      .filter((b) => !userAuthors.has(b.author.toLowerCase().trim()))
      .map((b) => {
        const genreScore = scores[b.genre] || 0;
        if (genreScore === 0) return null;
        const distFromAvg = Math.abs(b.year - avgYear);
        const distFromRecent = Math.abs(b.year - mostRecentYear);
        const minDist = Math.min(distFromAvg, distFromRecent);
        const yearBonus = Math.max(0, 15 - minDist);
        const baseScore = Math.round((genreScore / maxScore) * 80);
        const matchScore = Math.min(99, baseScore + yearBonus);
        const closerTo = distFromRecent <= distFromAvg ? "your recent reads" : "your average reading era";
        return {
          title: b.title,
          author: b.author,
          year: b.year,
          genre: b.genre,
          matchScore,
          reason: `${b.genre} · ${b.year} — close to ${closerTo}`,
          cover: "",
        };
      })
      .filter(Boolean) as Recommendation[];

    scored.sort((a, b) => b.matchScore - a.matchScore);
    setAllRecommendations(scored);
  };

  const handleRefresh = () => {
    const nextPage = page + 1;
    const maxPage = Math.ceil(allRecommendations.length / PAGE_SIZE) - 1;
    setPage(nextPage > maxPage ? 0 : nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1A1A2E] rounded-2xl p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (userBooks.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">📚</p>
        <p className="text-white text-xl font-semibold mb-2">Add some books first!</p>
        <p className="text-[#888888]">Add books to your library or wishlist and I'll figure out what you'll love next.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      <div className="flex-[3]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Picks for You ✨</h1>
            <p className="text-[#888888] mt-1">Pure math — genre scores, era matching, no repeated authors</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-[#1A1A2E] border border-[#C9A84C33] text-[#C9A84C] px-5 py-2.5 rounded-full hover:bg-[#C9A84C22] transition-colors font-semibold text-sm"
          >
            🔄 Refresh picks
          </button>
        </div>

        <p className="text-[#888888] text-xs mb-4">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, allRecommendations.length)} of {allRecommendations.length} recommendations
        </p>

        {displayed.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A2E] rounded-2xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-semibold">No matches found</p>
            <p className="text-[#888888] text-sm mt-2">Your reading list covers all our recommendations already!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayed.map((book, i) => (
              <div
                key={i}
                onClick={() => { console.log("clicked", book.title); setSelectedBook({ ...book, year: book.year.toString(), cover: coverCache[book.title] || "" }); }}
                className="bg-[#1A1A2E] rounded-2xl p-5 flex gap-5 items-center hover:bg-[#1f1f3d] transition-colors cursor-pointer"
              >
                {coverCache[book.title] ? (
                  <img src={coverCache[book.title]} alt={book.title} className="w-16 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-20 rounded-xl flex-shrink-0 bg-[#0D0D0D] flex items-center justify-center text-2xl animate-pulse">📖</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">{book.title}</h3>
                    <span className="text-[#C9A84C] font-bold text-sm">{book.matchScore}% match</span>
                  </div>
                  <p className="text-[#C9A84C] text-sm mt-1">{book.author} · {book.year}</p>
                  <p className="text-[#888888] text-sm mt-2">{book.reason}</p>
                  <div className="mt-3 w-full bg-[#0D0D0D] rounded-full h-1.5">
                    <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${book.matchScore}%` }} />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleRefresh}
              className="w-full py-4 rounded-2xl border border-[#C9A84C33] text-[#C9A84C] hover:bg-[#C9A84C22] transition-colors font-semibold mt-2"
            >
              🔄 Load next 20 picks
            </button>
          </div>
        )}
      </div>

      <div className="flex-[2] bg-[#1A1A2E] rounded-2xl p-6 h-fit sticky top-8">
        <h2 className="text-white font-semibold text-lg mb-1">Your Genre Profile</h2>
        <p className="text-[#888888] text-sm mb-6">Library = 1pt · Wishlist = 0.5pt</p>
        <div className="flex flex-col gap-4">
          {genreScores.map((g, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-white text-sm">{g.genre}</span>
                <span className="text-[#C9A84C] text-sm font-semibold">{g.score}pts</span>
              </div>
              <div className="w-full bg-[#0D0D0D] rounded-full h-2">
                <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: `${(g.score / (genreScores[0]?.score || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-[#ffffff11]">
          <p className="text-[#888888] text-xs leading-relaxed">
            Based on <span className="text-white">{userBooks.length} books</span> across{" "}
            <span className="text-white">{genreScores.length} genres</span>. Excludes your existing authors. Matches books within ±5 years of your reading era.
          </p>
        </div>
      </div>
    </div>
  );
}