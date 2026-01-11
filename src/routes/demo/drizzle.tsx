import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const Route = createFileRoute('/demo/drizzle')({
  component: DemoDrizzle,
})

function DemoDrizzle() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Drizzle Demo</h1>
      <p>This demo is currently disabled due to schema changes.</p>
    </div>
  )
}
