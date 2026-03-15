import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { books } = await req.json();

    if (!books || books.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const baseBook = books[Math.floor(Math.random() * books.length)];

    const author = baseBook.author || "";
    const year = parseInt(baseBook.year || "2000");

    const minYear = year - 5;
    const maxYear = year + 5;

    const searchQuery = encodeURIComponent(author);

    const res = await fetch(
      `https://openlibrary.org/search.json?author=${searchQuery}&limit=40`
    );

    const data = await res.json();

    const userTitles = books.map((b:any) =>
      b.title?.toLowerCase()
    );

    const filtered = data.docs.filter((b:any) => {
      if (!b.cover_i) return false;

      const publishYear = b.first_publish_year;
      if (!publishYear) return false;

      if (publishYear < minYear || publishYear > maxYear) return false;

      if (userTitles.includes(b.title?.toLowerCase())) return false;

      return true;
    });

    const recommendations = filtered
      .slice(0, 6)
      .map((b:any) => ({
        title: b.title,
        author: b.author_name?.[0] || "Unknown",
        year: b.first_publish_year,
        cover: `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`,
        reason: `Similar to ${author} books around ${year}`
      }));

    return NextResponse.json({ recommendations });

  } catch (error) {

    console.error("Recommendation error:", error);

    return NextResponse.json({ recommendations: [] });

  }
}