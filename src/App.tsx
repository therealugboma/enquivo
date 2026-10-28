import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import EmradSite from './pages/EmradSite'
import Hosted from './pages/Hosted'
import Layout from './pages/app/Layout'
import Overview from './pages/app/Overview'
import Inbox from './pages/app/Inbox'
import Pipeline from './pages/app/Pipeline'
import LeadDetail from './pages/app/LeadDetail'
import FollowUps from './pages/app/FollowUps'
import { QuotesList, QuoteEditor } from './pages/app/Quotes'
import WorkOrders from './pages/app/WorkOrders'
import Referrals from './pages/app/Referrals'
import Knowledge from './pages/app/Knowledge'
import Team from './pages/app/Team'
import Settings from './pages/app/Settings'
import Tour from './components/Tour'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/site/emrad" element={<EmradSite />} />
        <Route path="/e/:slug" element={<Hosted />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="inbox/:id" element={<Inbox />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="followups" element={<FollowUps />} />
          <Route path="quotes" element={<QuotesList />} />
          <Route path="quotes/new" element={<QuoteEditor key="new" />} />
          <Route path="quotes/:id" element={<QuoteEditor />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Tour />
    </HashRouter>
  )
}
