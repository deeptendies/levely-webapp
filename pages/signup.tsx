import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/router';

const isSecurePassword = (password: string) => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return password.length >= minLength && hasNumber && hasSpecialChar;
};

export default function Signup() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isSecurePassword(password)) {
      setMessage("Password must be at least 8 characters long, contain a number and a special character.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setMessage("Please check your email for verification");
    } catch (error: any) {
      if (error && error.message) {
        setMessage(`Signup error: ${error.message}`);
      } else {
        setMessage("An unknown error occurred.");
      }
    }
  };

  const router = useRouter();

  const goToMainPage = () => {
    router.push('/');
  };

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
            width={150}
            height={150}
          />
          <h4 className="mt-3 mb-4">Sign Up for Levely</h4>
          <form onSubmit={handleSignup}>
            <input name="email" type="email" placeholder="Email" className="form-control mb-2" />
            <input name="password" type="password" placeholder="Password" className="form-control mb-2" />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" className="form-control mb-2" />
            <div>
            <button type="submit" className="btn btn-primary me-2">Sign Up</button>
            <button type="button" className="btn btn-light" onClick={goToMainPage}>Return</button>
            </div>
          </form>
          {message && <div className="mt-3">{message}</div>}
        </div>
      </main>
    </>
  );
}
