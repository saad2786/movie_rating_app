import { useState, useEffect } from 'react'
const KEY = '17c91520'
export function useMovies(query) {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(
    function () {
      const controller = new AbortController()
      async function fetchData() {
        try {
          setError('')
          setIsLoading(true)
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          )
          if (!res.ok) throw new Error('Somthing Went Wrong!')
          const data = await res.json()
          if (data.Response === 'False') throw new Error(data.Error)

          setMovies(data.Search)
          setError('')
        } catch (err) {
          if (err.name !== 'AbortError') {
            setError(err.message)
            console.error(err.message)
          }
        } finally {
          setIsLoading(false)
        }
      }
      if (query.length < 3) {
        setError('')
        setMovies([])
        return
      }
      //   handleCloseMovie()
      fetchData()
      return function () {
        controller.abort()
      }
    },
    [query],
  )
  return { movies, isLoading, error }
}
