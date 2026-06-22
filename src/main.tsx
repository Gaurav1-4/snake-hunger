import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Lock screen orientation on first user interaction (industry standard for mobile web games)
const initOrientationLock = () => {
  try {
    const docEl = document.documentElement as any;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().then(() => {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      }).catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
  } catch (e) {
    // Fail silently on unsupported platforms
  }
  
  // Remove listeners after first run
  window.removeEventListener('click', initOrientationLock);
  window.removeEventListener('touchstart', initOrientationLock);
};

window.addEventListener('click', initOrientationLock);
window.addEventListener('touchstart', initOrientationLock);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
