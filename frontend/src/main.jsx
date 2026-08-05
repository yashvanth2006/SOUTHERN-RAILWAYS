
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { CircularGuardProvider } from './context/CircularGuard.jsx'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CircularGuardProvider>
      <App />
    </CircularGuardProvider>
  </BrowserRouter>
  
)


