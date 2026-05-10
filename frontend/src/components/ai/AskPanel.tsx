import { useState } from 'react'
import axios from 'axios'
import type { AskResponse, Listing } from '../../types'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

export default function AskPanel() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<AskResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const AI_BASE = import.meta.env.VITE_AI_SERVICE_URL ?? ''

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post<AskResponse>(`${AI_BASE}/ask`, { query, top_k: 5 })
      setResult(res.data)
    } catch {
      setError('Unable to reach the AI service. Make sure it is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 className="font-semibold text-slate-800">Ask HomeBase AI</h2>
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "2-bedroom rentals near transit under $2,500"'
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button type="submit" loading={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
          Ask
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}

      {result && !loading && (
        <div className="mt-4 space-y-3">
          <div className="bg-violet-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
            {result.answer}
          </div>
          {result.listings.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Relevant listings cited:</p>
              <div className="space-y-1">
                {result.listings.map((l: Listing) => (
                  <a
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="block text-sm text-primary-600 hover:underline"
                  >
                    {l.title} — ${l.price?.toLocaleString()}
                    {l.type === 'RENTAL' ? '/mo' : ''}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
