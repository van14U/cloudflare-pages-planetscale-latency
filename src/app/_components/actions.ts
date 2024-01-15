"use server"

import { Client } from "@planetscale/database";

const us_east_1_connection = new Client({
  url: process.env.DATABASE_URL_US_EAST_1 as string,
  // fetch: (url, init) => {
  //   if (init) {
  //     delete init.cache;
  //   }
  //   return fetch(url, init);
  // },
}).connection();

const sa_east_1_connection = new Client({
  url: process.env.DATABASE_URL_SA_EAST_1 as string,
  // fetch: (url, init) => {
  //   if (init) {
  //     delete init.cache;
  //   }
  //   return fetch(url, init);
  // },
}).connection();

const QUERY = "SELECT * FROM `t3-app_post` ORDER BY id DESC LIMIT 1";

export type BenchResult = {
  latencies: number[];
  location: any;
  names: string[];
} | undefined;

export async function bench(prev: BenchResult, data: FormData): Promise<BenchResult> {
  const region = data.get("region") as string | undefined;
  if (!region || (region !== "us-east-1" && region !== "sa-east-1")) {
    return
  }
  const connection = region === "us-east-1" ? us_east_1_connection : sa_east_1_connection;
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
    const res  = await connection.execute(QUERY);
    latencies[i + 1] = Date.now() - start;
    names[i + 1] = (res.rows.at(0)!.name as string);
  }
  return { latencies, location, names };
}
