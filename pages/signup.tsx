import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

export default function Signup() {
  return (
    <>
      <Head>
        <title>Sign Up - Levely</title>
      </Head>
      <main className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
        <div className="text-center">
          <Image 
            src="/logo.png" 
            alt="Levely Logo"
            width={250}
            height={250}
          />
          <h4 className="mt-3 mb-4">Sign Up for Levely</h4>
          <form>
            <input type="text" placeholder="Username" className="form-control mb-2" />
            <input type="email" placeholder="Email" className="form-control mb-2" />
            <input type="password" placeholder="Password" className="form-control mb-2" />
            <button type="submit" className="btn btn-primary">Sign Up</button>
          </form>
        </div>
      </main>
    </>
  )
}
