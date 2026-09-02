import { WorkType, type Work } from '#/types/api'

// Open Library's covers API is CORS-open (unlike arbitrary article/movie
// pages), so this fetches straight from the browser — no server round-trip
// needed. A missing cover isn't a 404, it's a 200 with an empty body, hence
// the content-type check instead of just `res.ok`.
export async function fetchIsbnCover(isbn: string): Promise<File | null> {
  try {
    const res = await fetch(
      `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`,
    )
    if (!res.ok) return null
    const contentType = res.headers.get('content-type')
    if (!contentType?.startsWith('image/')) return null
    return new File([await res.blob()], `${isbn}.jpg`, { type: contentType })
  } catch {
    return null
  }
}

export type CoverSource =
  { kind: 'isbn'; isbn: string } | { kind: 'og'; pageUrl: string }

/**
 * Where a work's cover can be fetched from, if anywhere. Books prefer their
 * ISBN (more precise than a scraped og:image); everything else — including a
 * future IMDb-linked movie — falls back to the link's og:image, since that's
 * already the general mechanism (IMDb/TMDb pages carry a poster og:image
 * same as any article), not a type-specific one.
 */
export function getCoverSource(work: Work): CoverSource | null {
  if (work.type === WorkType.BOOK && work.detail?.isbn) {
    return { kind: 'isbn', isbn: work.detail.isbn }
  }
  if (work.external_url) {
    return { kind: 'og', pageUrl: work.external_url }
  }
  return null
}
