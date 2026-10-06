import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import axios from 'axios'

interface NasaDetail {
    nasaId: string
    title: string
    date: string
    center: string
    description: string
    image: string
}

function DetailView() {
    const { nasaId } = useParams()

    const [searchParams] = useSearchParams()

    const source = searchParams.get('source') || 'list'

    const query = searchParams.get('query') || ''
    const sortBy = searchParams.get('sortBy') || 'title'
    const order = searchParams.get('order') || 'asc'

    const center = searchParams.get('center') || 'All'

    const [item, setItem] = useState<NasaDetail | null>(null)
    const [items, setItems] = useState<NasaDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    useEffect(() => {
    if (!nasaId) {
        setLoading(false)
        return
    }

    setLoading(true)
    setError(false)
    const detailRequest = axios.get(
        'https://images-api.nasa.gov/search',
        {
        params: {
            nasa_id: nasaId,
        },
        }
    )
    const listRequest = axios.get(
        'https://images-api.nasa.gov/search',
        {
        params: {
            q: 'space',
            media_type: 'image',
        },
        }
    )

    Promise.all([detailRequest, listRequest])
        .then(([detailResponse, listResponse]) => {

        const detailResult =
            detailResponse.data.collection.items[0]

        if (detailResult) {
            setItem({
            nasaId: detailResult.data[0].nasa_id,
            title: detailResult.data[0].title,
            date: detailResult.data[0].date_created,
            center:
                detailResult.data[0].center || 'Unknown',
            description:
                detailResult.data[0].description ||
                'No description available.',
            image:
                detailResult.links?.[0]?.href || '',
            })
        } else {
            setItem(null)
        }
        const results =
            listResponse.data.collection.items

        const nasaItems: NasaDetail[] = results.map(
            (result: any) => ({
            nasaId: result.data[0].nasa_id,
            title: result.data[0].title,
            date: result.data[0].date_created,
            center:
                result.data[0].center || 'Unknown',
            description:
                result.data[0].description ||
                'No description available.',
            image:
                result.links?.[0]?.href || '',
            })
        )

        let displayedItems: NasaDetail[] = []

        if (source === 'gallery') {
            if (center === 'All') {
            displayedItems = nasaItems
            } else {
            displayedItems = nasaItems.filter(
                (currentItem) =>
                currentItem.center === center
            )
            }
        } else {
            const filteredItems = nasaItems.filter(
            (currentItem) =>
                currentItem.title
                .toLowerCase()
                .includes(query.toLowerCase())
            )

            displayedItems = [...filteredItems].sort((a, b) => {
            let result = 0

            if (sortBy === 'title') {
                result = a.title.localeCompare(b.title)
            }

            if (sortBy === 'date') {
                result =
                new Date(a.date).getTime() -
                new Date(b.date).getTime()
            }

            return order === 'asc'
                ? result
                : -result
            })
        }

        setItems(displayedItems)
        setLoading(false)
        })
        .catch((error) => {
            console.error(error)
            setLoading(false)
            setError(true)
        })
    }, [nasaId, source, query, sortBy, order, center])

    if (loading) {
        return (
            <div className="status-message">
                Loading NASA details...
            </div>
        )
      }
      
      if (error) {
        return (
            <div className="page-container">
                <div className="error-message">
                    Failed to load NASA details.
                </div>
            </div>
        )
      }
      
      if (!item) {
        return (
            <div className="page-container">
                <div className="no-results">
                    Item not found.
                </div>
            </div>
        )
      }

    const currentIndex = items.findIndex(
    (currentItem) =>
        currentItem.nasaId === nasaId
    )


    const makeDetailUrl = (targetNasaId: string) => {
    if (source === 'gallery') {
        return (
        `/details/${encodeURIComponent(targetNasaId)}` +
        `?source=gallery` +
        `&center=${encodeURIComponent(center)}`
        )
    }

    return (
        `/details/${encodeURIComponent(targetNasaId)}` +
        `?source=list` +
        `&query=${encodeURIComponent(query)}` +
        `&sortBy=${sortBy}` +
        `&order=${order}`
    )
    }

    return (
    <div className="page-container">
        <div className="detail-card">
        <h1 className="detail-title">{item.title}</h1>

        {item.image && (
            <img
            className="detail-image"
            src={item.image}
            alt={item.title}
            />
        )}

        <div className="detail-meta">
            <p>Date: {item.date}</p>
            <p>Center: {item.center}</p>
        </div>

        <p className="detail-description">
            {item.description}
        </p>

        <div className="detail-navigation">
            {currentIndex > 0 ? (
            <Link
                className="nav-button"
                to={makeDetailUrl(
                items[currentIndex - 1].nasaId
                )}
            >
                ← Previous
            </Link>
            ) : (
            <span className="nav-button disabled">
                ← Previous
            </span>
            )}

            {currentIndex >= 0 &&
            currentIndex < items.length - 1 ? (
            <Link
                className="nav-button"
                to={makeDetailUrl(
                items[currentIndex + 1].nasaId
                )}
            >
                Next →
            </Link>
            ) : (
            <span className="nav-button disabled">
                Next →
            </span>
            )}
        </div>
        </div>
    </div>
    )
}

export default DetailView