'use client';

import arabicAlphabet from './data/arabic-alphabet.json';

export default function Home() {
  const { alphabet } = arabicAlphabet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <header className="text-center py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Arabic Alphabet
        </h1>
        <p className="text-gray-600">Tap a letter to hear its sound</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4" dir="rtl">
          {alphabet.map((letter, index) => (
            <button
              key={index}
              className="aspect-square bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:shadow-md transition-all duration-200 active:scale-95 flex flex-col items-center justify-center p-3"
              style={{ borderColor: letter.color + '40' }}
            >
              <span 
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{ 
                  color: letter.color,
                  fontFamily: 'Noto Sans Arabic, sans-serif'
                }}
              >
                {letter.letter}
              </span>
              <span className="text-xs text-gray-600 text-center">
                {letter.englishName}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
