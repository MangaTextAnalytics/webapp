import Link from 'next/link';
import React from 'react'
import { Manga } from '@prisma/client';

export const MangaCard: React.FC<{
  manga: Manga;
}> = ({ manga }) => {
  return (
    <Link 
      href={`/mangas/${manga.id}`}
      className={``} 
    >
      <div key={manga.id} className="flex gap-8 p-4 bg-canvas rounded-lg border hover:border-primaryPurple hover:bg-canvasInset transition duration-300 ease-in-out">
        <MangaCardInfo title={manga.title} author={manga.author} year={manga.year} />
        <MangaCardStats totalWords={manga.totalWords} uniqueWords={manga.uniqueWords} wordsUsedOnce={manga.wordsUsedOnce} wordsUsedOncePct={manga.wordsUsedOncePct} />
      </div>
    </Link>
  )
}

export const MangaCardInfo: React.FC<{
  title: string;
  author: string;
  year: number;
}> = ({ title, author, year }) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-semibold text-gray-500">Manga</p>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm font-semibold text-gray-500">by: {author} - {year}</p>
    </div>
  );
};

export const MangaCardStats: React.FC<{
  totalWords: number;
  uniqueWords: number;
  wordsUsedOnce: number;
  wordsUsedOncePct: number;
}> = ({ totalWords, uniqueWords, wordsUsedOnce, wordsUsedOncePct }) => {
  return (
    <>
      <div className="flex flex-col mt-6">
        <span className="text-fgMuted italic mr-4">Length (in words):</span>
        <span className="text-fgMuted italic mr-4">Unique Words:</span>
        <span className="text-fgMuted italic mr-4">Unique Words (used once):</span>
        <span className="text-fgMuted italic mr-4">Unique Words (used once %):</span>
      </div>
      <div className="flex flex-col mt-6">
        <p className="text-fgDefault">{totalWords}</p>
        <p className="text-fgDefault">{uniqueWords}</p>
        <p className="text-fgDefault">{wordsUsedOnce}</p>
        <p className="text-fgDefault">{wordsUsedOncePct}</p>
      </div>
    </>
  );
}

