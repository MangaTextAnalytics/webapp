import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { MangaCard } from "~/components/MangaCard";
import PageWithTopbar from "~/components/PageWithTopbar";
import { api } from "~/utils/api";

export default function Mangas() {
  const router = useRouter();
  const { query } = router;

  const [search, setSearch] = useState("");

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <PageWithTopbar>
          <div className="flex flex-col mx-auto mb-4 p-8 max-w-[950px]">
            <SearchBar value={search} onChange={setSearch} />
            <Results query={query.query as string || ""} />
          </div>
        </PageWithTopbar>
      </main>
    </>
  );
}

const SearchBar: React.FC<{ 
  value: string; onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const router = useRouter();
  return (
    <form
      className="flex flex-row items-center justify-between w-full mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push({
          pathname: "/mangas",
          query: { query: cleanQuery(value) },
        });
      }}
    >
      <input
        className="w-full px-4 py-2 text-lg text-gray-800 bg-canvasInset border border-gray-300 rounded-md focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-primaryPurple focus:border-transparent"
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  );
}

const Results: React.FC<{ query: string }> = ({ query }) => {
  const { data: results } = api.mangas.getMatching.useQuery({ query });

  return (
    <div className="flex flex-col">
      {results?.map((manga) => (
        <MangaCard manga={manga} />
      ))}
    </div>
  );
}

const cleanQuery = (query: string) => {
    // regex to split on whitespace
    const whitespace = RegExp(/\s/);
    // regex to remove non-alphanumeric characters
    const nonAlphaNumeric = RegExp(/[^a-zA-Z0-9]/);
    const keywords = query.split(whitespace).map((keyword) => {
      // remove non-alphanumeric characters
      return keyword.replace(nonAlphaNumeric, "");
    });

    return keywords.sort().join(" ");
};
