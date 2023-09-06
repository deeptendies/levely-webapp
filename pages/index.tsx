import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Levely - Get Your Next Job</title>
        <meta name="description" content="Helping you land your dream job" />
      </Head>
      <main className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Levely Logo"
            width={150}
            height={150}
          />

          {/* New Image with 40% smaller dimensions and padding */}
          <div className="mb-4" style={{ padding: '5px' }}>
            <Image
              src="/gallery/portrait.jpg"
              alt="New Image"
              width={234}  // 40% smaller than 390
              height={155}  // 40% smaller than 258
            />
          </div>
          <h5 className="mt-3 mb-4">Welcome to Levely</h5>
          <p className={`mb-4 ${styles.fadeIn}`}>
            Levely helps you get your next job. We offer resume assistance, smart analysis, a referral network, and personalized learning recommendations.
          </p>

          <div className="d-flex justify-content-center">
            <Link href="/signup">
              <button className="btn btn-primary me-2">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-light text-dark">Login</button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
