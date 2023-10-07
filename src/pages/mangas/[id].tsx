import { useRouter } from 'next/router'
import React from 'react'
import PageWithTopbar from '~/components/PageWithTopbar'
import { Frequency } from '~/server/api/routers/mangas'
import { api } from '~/utils/api'

const MangaPage:React.FC = () => {
  const router = useRouter()
  const id = router.query.id as string

  const { data: manga, isLoading } = api.mangas.getOne.useQuery({ id: +id })

  return (
    <PageWithTopbar>
      <div className="flex flex-col max-w-[950px] mx-auto p-8 bg-canvas">
        {(isLoading || !manga) && <p>Loading...</p>}
        {manga && (
          <>
            <div key={manga.id} className="flex gap-8">
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
            <hr className="mt-4"/>
            <Frequencies frequencies={manga.frequencies} />
          </>
        )}
      </div>
    </PageWithTopbar>
  )
}

const Frequencies: React.FC<{ frequencies: Frequency[] }> = ({ frequencies }) => {
  return (
    <div className="flex flex-col mt-6">
      <h2 className="text-2xl font-semibold">Frequencies</h2>
      <div className="flex flex-col mt-6 gap-4">
        {frequencies.map((freq) => (
          <div key={freq.termTerm} className="flex gap-8 p-4 rounded-lg border max-w-1/2">
            <div className="flex flex-col items-start">
              <h3 className="text-xl font-semibold">{freq.termTerm}</h3>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-fgDefault">{freq.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MangaPage
