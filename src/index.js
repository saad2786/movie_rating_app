import ReactDOM from 'react-dom/client'
import React from 'react'
import './index.css'
import App from './App'
// import StarRating from './StarRating'
// function Test() {
//   const [movieRating, setMovieRating] = useState(0)
//   return (
//     <div>
//       <StarRating
//         maxRating={9}
//         color="green"
//         onSetMovieRating={setMovieRating}
//       />
//       <p>This movie has rating of {movieRating}.</p>
//     </div>
//   )
// }
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
