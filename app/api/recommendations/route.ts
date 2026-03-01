import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { books } = await req.json();

    if (!books || books.length === 0) {
      return NextResponse.json({
        recommendations: "You haven't marked any books as 'Already Read' yet! Start reading and mark books as read to get personalised recommendations. 📚"
      });
    }

    const bookList = books
      .map((b: any) => `"${b.title}" by ${b.author}`)
      .join(", ");

    const prompt = `You are a friendly book recommendation assistant. 
    
The user has already read these books: ${bookList}.

Based on their reading history, recommend exactly 3 books they would love. 
For each book provide:
- Title
- Author  
- One sentence explaining why they'd enjoy it based on their reading history

Format your response exactly like this for each book:
BOOK: [title]
AUTHOR: [author]
REASON: [reason]

Be specific and reference their actual reading history in the reasons.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ recommendations: text });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}