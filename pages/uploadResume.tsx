import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function UploadResume() {
  const [resumeText, setResumeText] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [hasUploadedBefore, setHasUploadedBefore] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user's current resume from Firestore to determine if they've uploaded before
    const fetchResume = async () => {
      const userDoc = doc(db, "users", "userID");
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        setHasUploadedBefore(true);
        setResumeText(docSnap.data()?.resume || '');
      }
    };

    fetchResume();
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
  };

  const uploadResume = async () => {
    try {
      const userDoc = doc(db, "users", "userID");
      await setDoc(userDoc, { resume: resumeText });
      setMessage('Resume uploaded successfully.');
      setHasUploadedBefore(true);
    } catch (error) {
      setMessage('Error uploading resume.');
    }
  };

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <main className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
        <div className="text-center">
          <h1>Upload Your Resume</h1>
          {hasUploadedBefore && <p>My Current Resume</p>}
          <div>
            <textarea 
              placeholder="Paste your resume here"
              value={resumeText}
              onChange={handleTextChange}
              className="form-control mb-2"
              style={{ height: '200px' }} // Increase the height of the text box
            ></textarea>
          </div>
          <div>
            <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={uploadResume}>Upload</button>
            <button className="btn btn-light text-dark" style={{ marginLeft: '10px' }} onClick={returnToDashboard}>Return</button>
          </div>
          {message && <div className="mt-3">{message}</div>}
        </div>
      </main>
    </>
  );
}
