// pages/login.tsx

import Head from 'next/head'
import styles from '@/styles/Home.module.css'

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - Levely</title>
      </Head>
      <main className={styles.main}>
        <h1>Login</h1>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </main>
    </>
  )
}
