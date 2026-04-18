export const getNearbyHospitals = async (req, res) => {
    try {
        const { lat, lon } = req.query
        if (!lat || !lon)
            return res.status(400).json({ message: 'Latitude and longitude required' })

        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="hospital"](around:5000,${lat},${lon});
                way["amenity"="hospital"](around:5000,${lat},${lon});
            );
            out body;
        `

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        })

        const data = await response.json()

        const hospitals = data.elements
            .filter(el => el.tags?.name)
            .slice(0, 10)
            .map(el => ({
                id: el.id,
                name: el.tags.name,
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
                phone: el.tags?.phone || 'N/A',
                address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'N/A',
                website: el.tags?.website || el.tags?.['contact:website'] || null,
            }))

        res.json({ hospitals })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
