import React, { useState, useEffect } from 'react';

const quotes = [
  { text: "“Information retrieval is the science of searching for documents, for information within documents, and for metadata about documents.”", author: "— Manning, Raghavan, Schütze" },
  { text: "“TF‑IDF and cosine similarity: the heart of modern search engines.”", author: "— IR Fundamentals" },
  { text: "“The only source of knowledge is experience.”", author: "— Albert Einstein" },
  { text: "“Research is to see what everybody else has seen, and to think what nobody else has thought.”", author: "— Albert Szent-Györgyi" },
  { text: "“Your next breakthrough paper is just a search away.”", author: "— Student Research Search" }
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-center text-white">
      <p className="text-xl md:text-2xl italic font-light leading-relaxed">
        {quotes[index].text}
      </p>
      <p className="mt-4 text-orange-100 text-sm">{quotes[index].author}</p>
      <div className="flex justify-center gap-2 mt-6">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === index ? 'bg-white w-4' : 'bg-orange-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}