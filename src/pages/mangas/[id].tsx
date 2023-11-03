import { useRouter } from 'next/router'
import React from 'react'
import PageWithTopbar from '~/components/PageWithTopbar'
import { api } from '~/utils/api'
import Frequencies from '~/components/Frequencies'

const MangaPage:React.FC = () => {
  const router = useRouter()
  const mangaId = parseInt(router.query.id as string)

  const { data: manga, isLoading } = api.mangas.getOne.useQuery({ mangaId })
  const { data: mangaInLibrary, isLoading: mangaInLibraryLoading } = api.libraries.mangaInLibrary.useQuery({ mangaId })
  const { mutate } = api.libraries.updateMangaLibrary.useMutation()

  return (
    <PageWithTopbar>
      <div className="flex flex-col max-w-[950px] mx-auto gap-4 p-8 bg-canvas">
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
            <hr/>
            <div>
            <button 
              className="bg-primaryPurple disabled:bg-fgMuted font-semibold text-white rounded-md px-3 py-2 hover:bg-primaryPurpleDark hover:text-white hover:shadow-md transition duration-300 ease-in-out"
              disabled={mangaInLibrary}
              onClick={() => mutate({ mangaId, add: true })}
              >
              <span>
                {mangaInLibraryLoading ? "Adding..." : (
                  mangaInLibrary ? "Already added" : "+ Add to Library" 
                  )
                }
              </span>
            </button>
            </div>
            <hr/>
            <Frequencies frequencies={manga.frequencies} />
          </>
        )}
      </div>
    </PageWithTopbar>
  )
}

export default MangaPage
