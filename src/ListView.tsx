import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface NasaItem {
    nasaId: string
    title: string
    date: string
    center: string
    image: string
}

function ListView() {
    const [items, setItems] = useState<NasaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [query, setQuery] = useState('')
    const [sortBy, setSortBy] = useState<'title' | 'date'>('title')
    const [order, setOrder] = useState<'asc' | 'desc'>('asc')

    useEffect(() => {
    axios
        .get('https://images-api.nasa.gov/search', {
        params: {
            q: 'space',
            media_type: 'image',
        },
        })
        .then((response) => {
        const results = response.data.collection.items

        const nasaItems: NasaItem[] = results.map((item: any) => ({
            nasaId: item.data[0].nasa_id,
            title: item.data[0].title,
            date: item.data[0].date_created,
            center: item.data[0].center || 'Unknown',
            image: item.links?.[0]?.href || '',
        }))

        setItems(nasaItems)
        setLoading(false)
        })
        .catch((error) => {
            console.error(error)
            setError(true)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
          <div className="status-message">
            Loading NASA data...
          </div>
        )
      }
      
    if (error) {
        return (
            <div className="page-container">
            <div className="error-message">
                Failed to load NASA data.
            </div>
            </div>
        )
    }
    const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
    )

    const displayedItems = [...filteredItems].sort((a, b) => {
        let result = 0

        if (sortBy === 'title') {
            result = a.title.localeCompare(b.title)
        }

        if (sortBy === 'date') {
            result =
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        }

        return order === 'asc' ? result : -result
    })

    return (
        <div className="page-container">
            <h1 className="page-title">
                NASA Library
            </h1>
      
        <div className="controls">
            <input
                className="search-input"
                type="text"
                placeholder="Search by keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
      
            <select
                className="control-select"
                value={sortBy}
                onChange={(e) =>
                setSortBy(e.target.value as 'title' | 'date')
                }
            >
                <option value="title">Title</option>
                <option value="date">Date</option>
            </select>
      
            <select
                className="control-select"
                value={order}
                onChange={(e) =>
                setOrder(e.target.value as 'asc' | 'desc')
                }
            >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
        {displayedItems.length === 0 ? (
            <div className="no-results">
                No results found.
            </div>
            ) : (
            <div className="list">
                {displayedItems.map((item) => (
            <Link
                key={item.nasaId}
                to={
                `/details/${encodeURIComponent(item.nasaId)}` +
                `?source=list` +
                `&query=${encodeURIComponent(query)}` +
                `&sortBy=${sortBy}` +
                `&order=${order}`
                }
            >
                <div className="list-card">
                <h2>{item.title}</h2>
                <p>{item.date}</p>
                <p>{item.center}</p>
                </div>
            </Link>
                ))}
            </div>
        )}
        </div>
      )
}

export default ListView