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
          <Frequency term={freq.termTerm} count={freq.count} />
        ))}
      </div>
    </div>
  )
}

const Frequency: React.FC<{
  term: string;
  count: number;
}> = ({ term, count }) => {
  const { data: termWithRank } = api.term.getTermWithRank.useQuery({ term })

  return (
    <div key={term} className="flex gap-8 p-4 rounded-lg border max-w-1/2">
      <h3 className="text-xl font-semibold">{term}</h3>
      <p className="text-fgDefault">{count}</p>
      <div 
        className="text-fgMuted italic rounded border px-2 py-1 cursor-help"
        title={`This word is in the top ${termWithRank?.rank} most common words in our database.`}
      >
        {termWithRank?.rank}
      </div>
    </div>
  )
}

export default Frequencies
