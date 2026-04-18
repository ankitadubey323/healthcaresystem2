import fetch from 'node-fetch'

export const getLatestNews = async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ message: 'Missing NEWS_API_KEY in backend environment' })
  }

  const query = req.query.q?.trim()
  const pageSize = parseInt(req.query.pageSize || '20', 10)
  const url = query
    ? `https://newsapi.org/v2/everything?language=en&q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`
    : `https://newsapi.org/v2/top-headlines?country=us&category=health&pageSize=${pageSize}&apiKey=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    const articles = (data.articles || []).map((article, index) => ({
      id: index + 1,
      title: article.title || 'Untitled article',
      desc: article.description || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'Health News',
      url: article.url,
      image: article.urlToImage || '',
      publishedAt: article.publishedAt || '',
    }))

    res.json({ articles })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch news', error: err.message })
  }
}
