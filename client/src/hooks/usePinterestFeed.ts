"use client"

import { useEffect, useState } from "react"

type PinterestFeedItem = {
  id?: string
  title?: string
  image?: string
  thumbnail?: string
  cover?: string
  url?: string
  description?: string
  keywords?: string[]
  [key: string]: unknown
}

export function usePinterestFeed(query: string) {
  const [items, setItems] = useState<PinterestFeedItem[]>([])

  useEffect(() => {
    async function fetchPinterest() {
      try {
        const res = await fetch(`/public/pinterest_reels.json`)
        const local: PinterestFeedItem[] = await res.json()

        const normalizedQuery = query.trim().toLowerCase()
        const filtered = local.filter((item) => {
          if (!normalizedQuery) return false
          const title = String(item.title ?? "").toLowerCase()
          return title.includes(normalizedQuery)
        })

        setItems(filtered.length ? filtered : local)
      } catch {
        setItems([])
      }
    }

    fetchPinterest()
  }, [query])

  return { items }
}

