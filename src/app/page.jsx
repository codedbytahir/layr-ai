"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [style, setStyle] = useState("bold");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const styleOptions = [
    { key: "bold", label: "Bold & Brutal" },
    { key: "modern", label: "Clean & Modern" },
    { key: "scifi", label: "Futuristic & Sci-Fi" },
    { key: "horror", label: "Spooky & Horror" },
    { key: "handwritten", label: "Handwritten & Organic" },
    { key: "retro", label: "Retro & Pixelated" },
    { key: "elegant", label: "Elegant & Classy" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("text", text);
    formData.append("style", style);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      if (res.ok) {
        const blob = await res.blob();
        setResult(URL.createObjectURL(blob));
      } else {
        alert("Something went wrong. Check API Key.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-black selection:bg-[#a3e635] selection:text-black">
      
      {/* NAVBAR */}
      <nav className="border-b-4 border-black bg-[#a3e635] p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex">
          <Image src="/img-layr.png" alt="image-logo" width={60} height={3}/>
          <Image src="/text-logo.png" alt="text-logo" width={60} height={9} />
        </div>
        <div className="hidden md:block font-bold text-sm bg-white border-2 border-black px-4 py-1 shadow-[4px_4px_0px_0px_black]">
          BETA 0.1
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: CONTROLS */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_black]">
            <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black inline-block pb-1">
              Configuration
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Image Input */}
              <div>
                <label className="block font-bold mb-2 uppercase text-xs tracking-widest">1. Target Image</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm font-bold 
                      file:mr-4 file:py-3 file:px-6 
                      file:border-4 file:border-black file:bg-[#a3e635] file:text-black 
                      file:font-black hover:file:bg-[#84cc16] cursor-pointer
                      border-4 border-black bg-gray-100 p-2"
                  />
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block font-bold mb-2 uppercase text-xs tracking-widest">2. The Text</label>
                <input 
                  type="text" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. FLASH SALE 50%" 
                  className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:bg-[#ecfccb] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus:shadow-[4px_4px_0px_0px_black] transition-all"
                />
              </div>

              {/* Style Input */}
              <div>
                <label className="block font-bold mb-2 uppercase text-xs tracking-widest">3. Font Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border-4 border-black p-4 font-bold text-lg bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_black] transition-all appearance-none cursor-pointer"
                >
                  {styleOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading || !file || !text}
                className="mt-4 bg-[#a3e635] text-black font-black text-xl py-5 border-4 border-black 
                  shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] 
                  disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0
                  transition-all uppercase tracking-wide"
              >
                {loading ? "⚡ Processing..." : "Generate Overlay"}
              </button>
            </form>
          </div>
          
          <div className="bg-yellow-200 border-4 border-black p-6 font-bold text-sm shadow-[8px_8px_0px_0px_black]">
            <span className="text-xl mr-2">💡</span> 
            <span className="uppercase tracking-widest">Pro Tip:</span> 
            <p className="mt-2">AI automatically finds the "Negative Space" so text doesn't cover faces.</p>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="relative h-full min-h-[500px] flex flex-col">
           <div className="flex-1 bg-white border-4 border-black shadow-[16px_16px_0px_0px_black] flex items-center justify-center p-4 relative overflow-hidden">
              
              {!result && !loading && (
                <div className="text-center opacity-40">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-2xl font-black uppercase">Waiting for input</h3>
                </div>
              )}

              {loading && (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-[#a3e635] border-4 border-black mb-4 animate-spin"></div>
                  <h3 className="font-black uppercase text-xl">AI is Cooking...</h3>
                </div>
              )}

              {result && (
                <div className="relative w-full h-full flex items-center justify-center">
                   <img src={result} alt="Result" className="max-w-full max-h-[600px] border-2 border-black object-contain" />
                </div>
              )}
           </div>

           {result && (
             <a 
               href={result} 
               download="layr-result.jpg"
               className="mt-6 bg-black text-white font-black text-center py-4 border-4 border-black 
                 hover:bg-[#a3e635] hover:text-black hover:shadow-[8px_8px_0px_0px_black] transition-all uppercase"
             >
               Download Result
             </a>
           )}
        </div>

      </div>
    </div>
  );
}