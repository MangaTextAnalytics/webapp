import { api } from "~/utils/api";
import { CardStats } from "./MangaCard";
import Link from "next/link";

const Volumes: React.FC<{
  title: string;
  mangaId: number;
}> = ({ title, mangaId }) => {
  const { data: volumes } = api.volumes.getVolumes.useQuery({ mangaId })

  if(!volumes) return null

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold">Volumes</h2>
      <div className="flex grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
        {volumes.map((volume) => (
          <Link 
            className="flex flex-col p-4 bg-canvas rounded-lg border-2 hover:border-primaryPurple hover:bg-canvasInset transition duration-300 ease-in-out"
            href={`/volumes/${volume.id}`}
          >
            <p className="text-2xl font-semibold">
              <span className="font-normal text-gray-500 mr-2">{title}</span>
              vol. {volume.volume}
            </p>
            <div className="flex">
              <CardStats ownerId={volume.id} type="volume" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Volumes
