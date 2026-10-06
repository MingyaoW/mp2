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

function GalleryView() {
    const [items, setItems] = useState<NasaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCenter, setSelectedCenter] = useState('All')
    const [error, setError] = useState(false)
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
            setLoading(false)
            setError(true)
        })
    }, [])

    if (loading) {
        return (
            <div className="status-message">
                Loading NASA gallery...
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-message">
                    Failed to load NASA gallery.
                </div>
            </div>
        )
      }


    const centers = [
    'All',
    ...Array.from(new Set(items.map((item) => item.center))),
    ]

    const filteredItems =
    selectedCenter === 'All'
        ? items
        : items.filter((item) => item.center === selectedCenter)

    return (
    <div className="page-container">
        <h1 className="page-title">NASA Gallery</h1>

        <div className="controls">
        <div className="control-group">
            <label
            className="control-label"
            htmlFor="center-filter"
            >
            Filter by Center:
            </label>

            <select
            id="center-filter"
            className={
                selectedCenter === 'All'
                ? 'control-select'
                : 'control-select active-filter'
            }
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            >
            {centers.map((center) => (
                <option key={center} value={center}>
                {center}
                </option>
            ))}
            </select>
        </div>
        </div>
        {filteredItems.length === 0 ? (
        <div className="no-results">
            No images found for this center.
        </div>
        ) : (
            <div className="gallery">
            {filteredItems.map((item) => (
                <Link
                key={item.nasaId}
                to={
                    `/details/${encodeURIComponent(item.nasaId)}` +
                    `?source=gallery` +
                    `&center=${encodeURIComponent(selectedCenter)}`
                }
                >
                <div className="gallery-card">
                    {item.image && (
                    <img
                        className="gallery-image"
                        src={item.image}
                        alt={item.title}
                    />
                    )}

                    <div className="gallery-card-content">
                    <h2>{item.title}</h2>
                    <p>{item.center}</p>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        )}
    </div>
    )
}

export default GalleryView