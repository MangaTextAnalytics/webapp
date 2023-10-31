import { Frequency } from '~/server/api/routers/mangas'

const Frequencies: React.FC<{ frequencies: Frequency[] }> = ({ frequencies }) => {
  return (
    <div className="flex flex-col">
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

export default Frequencies
