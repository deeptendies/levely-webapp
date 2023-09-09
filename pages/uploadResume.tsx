import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

export default function UploadResume() {
  const [resumeText, setResumeText] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [hasUploadedBefore, setHasUploadedBefore] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResume = async () => {
        const userId = getAuth().currentUser?.uid;
        
        if (userId) {
            const userDoc = doc(db, "users", userId);
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                setResumeText(docSnap.data()?.resume || "");
            }
        }
    };

    fetchResume();
}, []);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
  };

  const uploadResume = async () => {
    try {
      const userId = getAuth().currentUser?.uid; // Get current user's ID
      if (!userId) {
        setMessage('User not authenticated.');
        return;
      }
      const userDoc = doc(db, "users", userId); // Use the actual user ID here
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
