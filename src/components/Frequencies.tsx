import { useState } from "react";
import { api } from "~/utils/api";

const Frequencies: React.FC<{ 
  ownerId: number;
  type: 'volume' | 'manga' | 'library';
  pageSize?: number;
}> = ({ ownerId, type, pageSize = 50 }) => {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(pageSize)
  const { data: frequencyPage } = api.frequencies.getFrequencies.useQuery({ ownerId, type, start, end })

  if(!frequencyPage || frequencyPage.frequencies.length === 0) return null

  const handlePageChange = (change: -1 | 1) => {
    change *= pageSize
    const newStart = Math.max(0, start + change)
    const newEnd = Math.min(frequencyPage.totalCount, newStart + pageSize)
    if(newStart === start || newEnd === end) return
    setStart(newStart)
    setEnd(newEnd)
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold">Frequencies</h2>
      <p className="text-right text-fgDefault">Showing {start + 1}..{end} from {frequencyPage.totalCount} results</p>
      <div className="mt-4 flex justify-between">
        <PageButton onClick={() => handlePageChange(-1)} text="Previous Page" hidden={start === 0} />
        <PageButton onClick={() => handlePageChange(1)} text="Next Page" hidden={end === frequencyPage.totalCount} />
      </div>
      <div className="flex flex-col mt-6 gap-4">
        {frequencyPage.frequencies.map((freq) => (
          <Frequency term={freq.termTerm} count={freq.count} />
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <PageButton onClick={() => handlePageChange(-1)} text="Previous Page" hidden={start === 0} />
        <PageButton onClick={() => handlePageChange(1)} text="Next Page" hidden={end === frequencyPage.totalCount} />
      </div>
    </div>
  )
}

const PageButton: React.FC<{
  onClick: () => void;
  text: string;
  hidden: boolean;
}> = ({ onClick, text, hidden }) => {
  return (
    <button
      className="border-b-2 hover:border-primaryPurple transition duration-300 ease-in-out"
      onClick={onClick}
    >
      {!hidden && <span className="px-4 py-2 font-semibold text-lg text-primaryPurple">{text}</span>}
    </button>
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
