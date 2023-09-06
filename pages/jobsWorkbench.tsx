import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../utils/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
    const router = useRouter();

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

    const handleReturn = () => {
        router.push('/dashboard');
    };

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
        <div className="container">
          <h1>Jobs Workbench</h1>
          <button className="btn btn-info mb-3" onClick={() => router.push('/dashboard')}>Return</button>
          <p>Manage your job descriptions here.</p>
          
          <div className="row">
            <div className="col-4">
              <div className="d-flex justify-content-between mb-3">
                <button className="btn btn-secondary" onClick={handleAddNew}>Add New</button>
                <button className="btn btn-danger" onClick={handleRemove}>Remove</button>
              </div>
              <ul className="list-group">
                {jobList.map((job) => (
                  <li key={job.id} className="list-group-item" onClick={() => handleEdit(job)}>
                    {job.name}
                  </li>
                ))}
              </ul>
            </div>
    
            <div className="col-8">
              {showForm && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Job Name"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                  <textarea
                    className="form-control mb-3"
                    placeholder="Job Description"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <input type="text" className="form-control mb-3" placeholder="Job Analysis"/>
                  <div className="d-flex justify-content-between mb-3">
                    <button className="btn btn-primary">Analyze</button>
                    <button className="btn btn-primary">Rewrite Resume</button>
                    <button className="btn btn-warning">Copy</button>
                    <button className="btn btn-success" onClick={handleSave}>Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
