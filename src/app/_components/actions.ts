"use server"

import { Client } from "@planetscale/database";

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

const QUERY = "SELECT * FROM `t3-app_post` ORDER BY id DESC LIMIT 1";

export type BenchResult = {
  latencies: number[];
  location: any;
} | undefined;

export async function bench(prev: BenchResult, data: FormData): Promise<BenchResult> {
  const region = data.get("region") as string | undefined;
  if (!region || (region !== "us-east-1" && region !== "sa-east-1")) {
    return
  }
  const connection = region === "us-east-1" ? us_east_1_connection : sa_east_1_connection;
  const start = Date.now();
  await connection.execute(QUERY);
  const firstQueryLatency = Date.now() - start;

  const location = await fetch("https://vercel-geo-delta.vercel.app/api/geo")
    .then(res => res.json())

  console.log(location);

  const latencies = new Array<number>(10);
  latencies[0] = firstQueryLatency;
  for (let i = 0; i < 9; i++) {
    const start = Date.now();
    await connection.execute(QUERY);
    latencies[i + 1] = Date.now() - start;
    // await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log(latencies);

  return { latencies, location };
}
