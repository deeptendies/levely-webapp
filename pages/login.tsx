import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('auth');
    if (token) {
      router.push('/dashboard');
      // Logic to automatically log the user in with the token
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        Cookies.set('auth', userCredential.user.refreshToken);
        setMessage('Logged in successfully.');
  
        // Add this line to wait for 2 seconds and then navigate
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage('Error logging in: ' + error.message);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };
  

  return (
    <>
      <Head>
        <title>Login - Levely</title>
      </Head>
      <main className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
        <div className="text-center">
          <Image 
            src="/logo.png" 
            alt="Levely Logo"
            width={150}
            height={150}
          />
          <h4 className="mt-3 mb-4">Login to Levely</h4>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="form-control mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="form-control mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          {message && <div className="mt-3">{message}</div>}
        </div>
      </main>
    </>
  );
}
