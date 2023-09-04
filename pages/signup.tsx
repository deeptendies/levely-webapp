// pages/signup.tsx

import Head from 'next/head'
import styles from '@/styles/Home.module.css'

export default function Signup() {
  return (
    <>
      <Head>
        <title>Sign Up - Levely</title>
      </Head>
      <main className={styles.main}>
        <h1>Sign Up</h1>
        <form>
          <input type="text" placeholder="Username" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign Up</button>
        </form>
      </main>
    </>
  )
}
