import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { DebrisPage } from './pages/DebrisPage'
import { DebrisDetailPage } from './pages/DebrisDetailPage'
import { MissionsPage } from './pages/MissionsPage'
import { AlertsPage } from './pages/AlertsPage'
import { NasaPage } from './pages/NasaPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/debris" element={<DebrisPage />} />
          <Route path="/debris/:id" element={<DebrisDetailPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/nasa" element={<NasaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
