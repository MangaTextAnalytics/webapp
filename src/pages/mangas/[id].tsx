import { useRouter } from 'next/router'
import PageWithTopbar from '~/components/PageWithTopbar'
import { api } from '~/utils/api'
import Frequencies from '~/components/Frequencies'
import { MangaCard } from '~/components/MangaCard'
import { useSession } from 'next-auth/react'
import Volumes from '~/components/Volumes'

const MangaPage: React.FC = () => {
  const router = useRouter()
  const mangaId = parseInt(router.query.id as string)

  const { data: session } = useSession()
  const { data: manga, isLoading } = api.mangas.getOne.useQuery({ mangaId })
  const { data: mangaInLibrary, isLoading: mangaInLibraryLoading } = api.libraries.mangaInLibrary.useQuery({ mangaId })
  const { mutate } = api.libraries.updateMangaLibrary.useMutation()

  return (
    <PageWithTopbar>
      <div className="flex flex-col max-w-[950px] mx-auto gap-4 p-8 bg-canvas">
        {(isLoading || !manga) && <p>Loading...</p>}
        {manga && (
          <>
            <MangaCard manga={manga} disableLink />
            <hr/>
            {session?.user && (
              <>
                <div>
                  <button 
                    className="bg-primaryPurple disabled:bg-fgMuted disabled:cursor-not-allowed font-semibold text-white rounded-md px-3 py-2 hover:bg-primaryPurpleDark hover:text-white hover:shadow-md transition duration-300 ease-in-out"
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
              </>
            )}
            <Volumes title={manga.title} mangaId={manga.id} />
            <Frequencies ownerId={manga.id} type="manga" />
          </>
        )}
      </div>
    </PageWithTopbar>
  )
}

export default MangaPage
