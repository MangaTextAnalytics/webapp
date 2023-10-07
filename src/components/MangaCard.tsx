import Link from 'next/link';
import React from 'react'
import { Manga } from '~/server/api/routers/mangas'

export const MangaCard: React.FC<{
  manga: Manga;
}> = ({ manga }) => {
  return (
    <Link 
      href={`/manga/${manga.id}`}
      className={``} 
    >
      <div key={manga.id} className="flex gap-8 p-4 bg-canvas rounded-lg border hover:border-primaryPurple hover:bg-canvasInset transition duration-300 ease-in-out">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-500">Manga</p>
          <h2 className="text-2xl font-semibold">{manga.title}</h2>
          <p className="text-sm font-semibold text-gray-500">by: {manga.author} - {manga.year}</p>
        </div>
        <div className="flex flex-col mt-6">
          <span className="text-fgMuted italic mr-4">Length (in words):</span>
          <span className="text-fgMuted italic mr-4">Unique Words:</span>
          <span className="text-fgMuted italic mr-4">Unique Words (used once):</span>
          <span className="text-fgMuted italic mr-4">Unique Words (used once %):</span>
        </div>
        <div className="flex flex-col mt-6">
          <p className="text-fgDefault">{manga.totalWords}</p>
          <p className="text-fgDefault">{manga.uniqueWords}</p>
          <p className="text-fgDefault">{manga.wordsUsedOnce}</p>
          <p className="text-fgDefault">{manga.wordsUsedOncePct}</p>
        </div>
      </div>
    </Link>
  )
}
