import { Results } from "./_components/benchmark";

import { Client } from "@planetscale/database";

export const runtime = "edge";

const QUERY = "SELECT * FROM `t3-app_post` ORDER BY id DESC LIMIT 1";

const us_east_1_connection = new Client({
  url: process.env.DATABASE_URL_US_EAST_1 as string,
  fetch: (url, init) => {
    if (init) {
      delete init.cache;
    }
    return fetch(url, init);
  },
}).connection();

const sa_east_1_connection = new Client({
  url: process.env.DATABASE_URL_SA_EAST_1 as string,
  fetch: (url, init) => {
    if (init) {
      delete init.cache;
    }
    return fetch(url, init);
  },
}).connection();

export const revalidate = 0;

export default async function Home(
  props: {
    searchParams: { [key: string]: string | string[] | undefined }
  }
) {
  console.log(props);
  let region = props.searchParams.region
  if (!region || (region !== "us-east-1" && region !== "sa-east-1")) {
    region = "us-east-1"
  }

  const connection = region === "us-east-1" ?
    us_east_1_connection : sa_east_1_connection;
  const start = Date.now();
  const first = await connection.execute(QUERY);
  const firstQueryLatency = Date.now() - start;
  const firstNameRecord = (first.rows.at(0)!.name as string);

  const location = await fetch("https://vercel-geo-delta.vercel.app/api/geo")
    .then(res => res.json())

  const latencies = new Array<number>(10);
  const names = new Array<string>(10);
  latencies[0] = firstQueryLatency;
  names[0] = firstNameRecord;
  for (let i = 0; i < 9; i++) {
    const start = Date.now();
    const res = await connection.execute(QUERY);
    latencies[i + 1] = Date.now() - start;
    names[i + 1] = (res.rows.at(0)!.name as string);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex gap-2">
        <h1 className="text-4xl font-bold">Tesing {region}</h1>
        <a href="/?region=us-east-1" className="text-blue-500 underline">
          us-east-1
        </a>
        <a href="/?region=sa-east-1" className="text-blue-500 underline">
          sa-east-1
        </a>
      </div>
      <Results results={{ latencies, names, location }} />
      <div>
        <p>
          Worker region
        </p>
        <div>{JSON.stringify(location, null, 2)} </div>
      </div>
    </main>
  )
}
