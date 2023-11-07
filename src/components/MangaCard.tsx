import Link from 'next/link';
import React from 'react'
import { Manga } from '@prisma/client';
import { api } from '~/utils/api';

export const MangaCard: React.FC<{
  manga: Manga;
  disableLink?: boolean;
}> = ({ manga, disableLink }) => {
  const hoverClass = disableLink ? "" : "hover:border-primaryPurple hover:bg-canvasInset transition duration-300 ease-in-out"
  const className = `flex gap-8 p-4 bg-canvas rounded-lg border-2 ${hoverClass}`

 let inner = (
      <div key={manga.id} className={className}>
        <MangaCardInfo title={manga.title} author={manga.author} year={manga.year} />
        <CardStats ownerId={manga.id} type="manga" />
      </div>
    )

  return disableLink ? inner : <Link href={`/mangas/${manga.id}`}> {inner} </Link>
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

export const CardStats: React.FC<{
  ownerId: number;
  type: 'volume' | 'manga' | 'library';
}> = ({ ownerId, type }) => {
  const { data: stats } = api.stats.getStats.useQuery({ ownerId, type });

  return (
    <>
      <div className="flex flex-col mt-6">
        <span className="text-fgMuted italic mr-4">Length (in words):</span>
        <span className="text-fgMuted italic mr-4">Unique Words:</span>
        <span className="text-fgMuted italic mr-4">Unique Words (used once):</span>
        <span className="text-fgMuted italic mr-4">Unique Words (used once %):</span>
      </div>
      <div className="flex flex-col mt-6">
        <p className="text-fgDefault">{stats?.totalWords}</p>
        <p className="text-fgDefault">{stats?.uniqueWords}</p>
        <p className="text-fgDefault">{stats?.wordsUsedOnce}</p>
        <p className="text-fgDefault">{stats?.wordsUsedOncePct && Math.round(stats.wordsUsedOncePct * 100) / 100}%</p>
      </div>
    </>
  );
}
