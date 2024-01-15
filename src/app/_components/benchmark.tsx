"use client"

import { useFormState, useFormStatus } from "react-dom"
import { bench } from "./actions"
import { type ButtonHTMLAttributes } from "react"

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus()
  return (
    <button
      {...props}
      disabled={pending}
      className={`border disabled:opacity-70 rounded-md px-3 py-1 bg-neutral-900 dark:bg-white dark:text-black ${props.className || ""
        }`}
    />
  )
}

function Results(props: { results?: { latencies: number[] } }) {

  if (!props.results?.latencies) {
    return null
  }

  const rawResult = structuredClone(props.results.latencies);
  const copy = structuredClone(props.results.latencies);
  const median = copy.sort()[Math.floor(copy.length / 2)]
  const avg = copy.reduce((a, b) => a + b, 0) / copy.length
  const max = copy.reduce((a, b) => Math.max(a, b), 0)
  const min = copy.reduce((a, b) => Math.min(a, b), Infinity)

  return (
    <div className="grid gap-2">
      {rawResult.map(lat => (
        <div key={Math.random()}>{lat}ms</div>
      ))}
      <div>Median: {median}ms</div>
      <div>Average: {avg}ms</div>
      <div>Max: {max}ms</div>
      <div>Min: {min}ms</div>
    </div>
  )
}

export function Bench() {
  const [state, formAction] = useFormState(bench, undefined);

  return (
    <div>
      {state?.location && <div>
        <p>Worker Location:</p>
        <div>{JSON.stringify(state.location, null, 2)} </div>
      </div>}
      <form action={formAction} className="grid gap-2" >
        <select name="region" className="dark:bg-black rounded-md border px-3 py-1">
          <option value="us-east-1">us-east-1</option>
          <option value="sa-east-1">sa-east-1</option>
        </select>
        <Button
          type="submit"
          className="border rounded-md px-3 py-1 bg-neutral-900 dark:bg-white dark:text-black"
        >
          Measure
        </Button>
      </form>
      <Results key={JSON.stringify(state?.latencies)} results={state} />
    </div>
  )
}
