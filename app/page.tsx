"use client";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/library");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-8">
      <div className="max-w-6xl w-full flex items-center justify-between gap-16">
        
        {/* Left side */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">📚</span>
            <h1 className="text-4xl font-bold text-[#C9A84C]">BookShelf</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Your reading life,<br />
            <span className="text-[#C9A84C]">beautifully organised.</span>
          </h2>
          
          <p className="text-[#888888] text-xl mb-10">
            Track what you've read, discover what to read next.
          </p>
          
          <div className="flex flex-col gap-4 max-w-sm">
            <button
              onClick={handleGoogleLogin}
              className="bg-[#C9A84C] text-black font-semibold py-4 px-8 rounded-full text-lg hover:bg-[#b8963d] transition-colors"
            >
              Continue with Google
            </button>
            <button className="border border-[#C9A84C] text-[#C9A84C] font-semibold py-4 px-8 rounded-full text-lg hover:bg-[#C9A84C] hover:text-black transition-colors">
              Sign in with Email
            </button>
          </div>
          
          <p className="text-[#888888] mt-6">
            New here?{" "}
            <span className="text-[#C9A84C] cursor-pointer hover:underline">
              Create an account
            </span>
          </p>
        </div>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4">
            {["#1A1A2E", "#16213E", "#0F3460", "#1A1A2E", "#2D1B69", "#1A1A2E"].map((color, i) => (
              <div
                key={i}
                className="rounded-xl w-28 h-40 flex items-end p-3"
                style={{ 
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${i % 2 === 0 ? "#C9A84C33" : "#C9A84C11"}`
                }}
              >
                <div className="w-full h-1 rounded-full bg-[#C9A84C] opacity-60" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}