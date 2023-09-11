// pages/_app.tsx

import 'bootstrap/dist/css/bootstrap.css'
import '../styles/loading-popup.css';
import '../styles/table-card.css';
import '../styles/ScreenSizeAlert.css';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
