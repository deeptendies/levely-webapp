import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'  // Make sure you import your stylesheet

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
            width={250}  // Increased the width
            height={250} // Increased the height
          />
          <h4 className="mt-3 mb-4">Welcome to Levely</h4> {/* Use h4 to make text smaller */}
          <p className="mb-4">
            Levely helps you get your next job. We offer resume assistance, smart analysis, a referral network, and personalized learning recommendations.
          </p>
          <div className="d-flex justify-content-center">
            <Link href="/signup">
              <button className="btn btn-primary me-2">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-secondary">Login</button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
