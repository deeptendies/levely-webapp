import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../utils/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { functions } from '../utils/firebase';
import { httpsCallable } from "firebase/functions";


interface JobData {
    id: string;
    name: string;
    description: string;
    analysis?: string;
    rewrittenResume?: string;
}

export default function JobsWorkbench() {
    const [user] = useAuthState(auth);
    const [jobList, setJobList] = useState<JobData[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [jobName, setJobName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const router = useRouter();
    const [jobAnalysis, setJobAnalysis] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rewrittenResume, setRewrittenResume] = useState("");

    const getIdToken = async () => {
        if (auth.currentUser) {
            return await auth.currentUser.getIdToken();
        }
        return null;
    };

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
            setSelectedJob(null); // Add this line
            setShowForm(false); // Hide the form
        }
    };

    const handleSave = async () => {
        const jobData = {
            name: jobName,
            description: jobDescription,
            analysis: jobAnalysis,
            rewrittenResume: rewrittenResume
        };

        if (selectedJob) {
            await updateDoc(doc(db, 'jobs', selectedJob.id), jobData);
        } else {
            await addDoc(collection(db, 'jobs'), jobData);
        }
        setShowForm(false);
    };

    const handleEdit = (job: JobData) => {
        setSelectedJob(job);
        setJobName(job.name);
        setJobDescription(job.description);
        setJobAnalysis(job.analysis || "");
        setRewrittenResume(job.rewrittenResume || "");
        setShowForm(true);
    };

    const [resumeText, setResumeText] = useState("");
    useEffect(() => {
        // New code for fetching resumeText
        const fetchResume = async () => {
            const userDoc = doc(db, "users", "userID");  // replace "userID" with the actual user ID
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                setResumeText(docSnap.data()?.resume || "");
            }
        };

        fetchResume();
    }, []);


    const handleAnalyze = async () => {
        try {
            setIsLoading(true);  // Add this line to start loading
            // Initialize the function
            const callOpenAI = httpsCallable(functions, 'openAI');

            const systemPrompt = `Answer concisely. Analyze if this job posting is a good match to my resume. 

            In the following format:
            1. **Skills Required**: Check if the candidate has the technical and soft skills listed.
            * meeting 
            * missing
            
            2. **Experience**: Look for the number of years of experience required and see if the candidate meets it.
            * meeting 
            * missing
            
            3. **Education**: Does the candidate meet the educational requirements?
            * meeting 
            * missing
            `

            const userPrompt = `job description= """${jobDescription}"""\nresume= """${resumeText}"""`;

            // Call the function and get the result
            const result = await callOpenAI({ system: systemPrompt, user: userPrompt, max_tokens: 2000 });

            // Check each level for undefined
            const data = result.data as any;
            if (data && data.response && data.response.choices && data.response.choices.length > 0) {
                const messageContent = data.response.choices[0].message.content;

                // Set jobAnalysis to the message content
                setJobAnalysis(messageContent);
            } else {
                console.error("Unexpected structure in result: ", result);
            }

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleRewriteResume = async () => {
        try {
            setIsLoading(true);
            const callOpenAI = httpsCallable(functions, 'openAI');

            const systemPrompt = "Rewrite the resume in a more professional way.";  // Add your prompt here
            const userPrompt = `resume= """${resumeText}"""`;

            const result = await callOpenAI({ system: systemPrompt, user: userPrompt, max_tokens: 2000 });

            const data = result.data as any;
            if (data && data.response && data.response.choices && data.response.choices.length > 0) {
                const messageContent = data.response.choices[0].message.content;

                // Set rewrittenResume to the message content
                setRewrittenResume(messageContent);
            } else {
                console.error("Unexpected structure in result: ", result);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container">
            {isLoading && (
                <div className="loading-popup">
                    <div className="loading-icon"></div>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Jobs Workbench</h1>
                <span>Logged in as {user ? user.email : "Loading..."}</span>
                <button className="btn btn-light text-dark ml-3" onClick={handleReturn}>Return</button>
            </div>
            <p>Manage your job descriptions and analyses here.</p>

            <div className="row">
                <div className="col-4">
                    <h3>Job List</h3>
                    <p>Click to select a job for editing.</p>
                    <button className="btn btn-light text-dark mb-3" onClick={handleAddNew}>Add New</button>
                    <ul className="list-group">
                        {jobList.map((job, index) => (
                            <li
                                key={job.id}
                                className={`list-group-item ${selectedJob?.id === job.id ? "active" : ""}`}
                                onClick={() => handleEdit(job)}
                            >
                                {job.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-8">
                    <h3>Job Details</h3>
                    <p>Edit the selected job or add a new one.</p>
                    {showForm && (
                        <div>
                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Job Name"
                                value={jobName}
                                onChange={(e) => setJobName(e.target.value)}
                            />
                            <textarea
                                className="form-control mb-2"
                                placeholder="Job Description"
                                rows={5}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <hr />
                            <button className="btn btn-primary mb-2" onClick={handleAnalyze}>Analyze</button>
                            <textarea
                                className="form-control mb-2"
                                placeholder="Job Analysis"
                                rows={5}
                                value={jobAnalysis}
                                readOnly  // If you want it to be read-only
                            />
                            <hr />
                            <div className="mb-2">
                                <button className="btn btn-primary" style={{ marginRight: '8px' }} onClick={handleRewriteResume}>Rewrite Resume</button>
                                <button className="btn btn-light text-dark">Copy</button>
                            </div>
                            <textarea
                                className="form-control mb-2"
                                placeholder="Rewritten Resume"
                                rows={5}
                                value={rewrittenResume}
                                readOnly
                            />
                            <div className="mt-2">
                                <button className="btn btn-primary" style={{ marginRight: '8px' }} onClick={handleSave}>Save</button>
                                <button className="btn btn-light text-dark" onClick={handleRemove}>Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
