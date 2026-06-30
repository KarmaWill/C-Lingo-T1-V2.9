import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App'
import { getLocaleById, loadStoredLocaleId } from './data/localeConfig'
import './i18n'
import './index.css'

const initialLocale = getLocaleById(loadStoredLocaleId())
document.documentElement.lang = initialLocale.htmlLang
document.documentElement.style.setProperty('--app-font-family', initialLocale.fontFamily)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

