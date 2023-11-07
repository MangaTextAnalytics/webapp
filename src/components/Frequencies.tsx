import { api } from "~/utils/api";

const Frequencies: React.FC<{ 
  ownerId: number;
  type: 'volume' | 'manga' | 'library';
}> = ({ ownerId, type }) => {
  const { data: frequencies } = api.frequencies.getFrequencies.useQuery({ ownerId, type })

  if(!frequencies) return null

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold">Frequencies</h2>
      <div className="flex flex-col mt-6 gap-4">
        {frequencies.map((freq) => (
          <div key={freq.termTerm} className="flex gap-8 p-4 rounded-lg border max-w-1/2">
            <h3 className="text-xl font-semibold">{freq.termTerm}</h3>
            <p className="text-fgDefault">{freq.count}</p>
            <div 
              className="text-fgMuted italic rounded border px-2 py-1 cursor-help"
              title={`This word is in the top 100 most common words in our database.`}
            >
              100
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Frequencies
