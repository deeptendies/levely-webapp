import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';  // Your existing Firestore setup
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import styles from '@/styles/Home.module.css';

interface JobData {
  id: string;
  name: string;
  description: string;
  analysis?: string;
  rewrittenResume?: string;
}

export default function JobsWorkbench() {
  const [jobList, setJobList] = useState<JobData[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const newJobs: JobData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobData));
      setJobList(newJobs);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleAddNew = () => {
    setJobName("");
    setJobDescription("");
    setSelectedJob(null);
    setShowForm(true);
  };

  const handleRemove = async () => {
    if (selectedJob) {
      await deleteDoc(doc(db, 'jobs', selectedJob.id));
    }
  };

  const handleSave = async () => {
    if (selectedJob) {
      await updateDoc(doc(db, 'jobs', selectedJob.id), { name: jobName, description: jobDescription });
    } else {
      await addDoc(collection(db, 'jobs'), { name: jobName, description: jobDescription });
    }
    setShowForm(false);
  };

  const handleEdit = (job: JobData) => {
    setSelectedJob(job);
    setJobName(job.name);
    setJobDescription(job.description);
    setShowForm(true);
  };

  return (
    <div className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
      <div className="text-center">
        <button className="btn btn-secondary mb-2" onClick={handleAddNew}>Add New</button>
        <button className="btn btn-danger mb-2" onClick={handleRemove}>Remove</button>

        {showForm && (
          <form>
            <input
              type="text"
              placeholder="Job Name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <button className="btn btn-success" type="button" onClick={handleSave}>Save</button>
          </form>
        )}

        <ul>
          {jobList.map((job) => (
            <li key={job.id} onClick={() => handleEdit(job)}>
              {job.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
