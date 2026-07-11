import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CV from './pages/CV'
import JobScraperMarket from './pages/JobScraperMarket'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/cv" replace />} />
          <Route path="cv" element={<CV />} />
          <Route path="generate-cv" element={<Navigate to="/cv" replace />} />
          <Route path="job-scraper-market" element={<JobScraperMarket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
