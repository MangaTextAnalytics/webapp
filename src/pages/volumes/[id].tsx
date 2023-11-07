import { useRouter } from 'next/router'
import PageWithTopbar from '~/components/PageWithTopbar'
import { api } from '~/utils/api'
import Frequencies from '~/components/Frequencies'
import { Volume } from '@prisma/client'
import { CardStats } from '~/components/MangaCard'
import Link from 'next/link'

const VolumePage: React.FC = () => {
  const router = useRouter()
  const volumeId = parseInt(router.query.id as string)

  const { data: volume, isLoading } = api.volumes.getOne.useQuery({ volumeId })
  const { data: title } = api.volumes.getTitle.useQuery({ mangaId: volume?.mangaId })

  return (
    <PageWithTopbar>
      <div className="flex flex-col max-w-[950px] mx-auto gap-4 p-8 bg-canvas">
        {(isLoading || !volume) && <p>Loading...</p>}
        {volume && (
          <>
            <VolumeCard title={title || ""} volume={volume} />
            <hr/>
            <Frequencies ownerId={volume.id} type="volume" />
          </>
        )}
      </div>
    </PageWithTopbar>
  )
}

const VolumeCard: React.FC<{
  title: string;
  volume: Volume;
}> = ({ title, volume }) => {
  return (
    <div 
      key={volume.id} 
      className="flex gap-8 p-4 bg-canvas rounded-lg border-2"
    >
      <VolumeCardInfo title={title} volume={volume.volume} mangaId={volume.mangaId} />
      <CardStats ownerId={volume.id} type="volume" />
    </div>
  )
}

const VolumeCardInfo: React.FC<{
  title: string;
  volume: number;
  mangaId: number;
}> = ({ title, volume, mangaId }) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-semibold text-gray-500">Volume</p>
      <p className="text-2xl font-semibold">
        <Link 
          className="text-gray-500 mr-2 underline hover:text-primaryPurple transition duration-300 ease-in-out"
          href={`/mangas/${mangaId}`}
        >
          {title}
        </Link>
        vol. {volume}
      </p>
    </div>
  );
};


export default VolumePage
