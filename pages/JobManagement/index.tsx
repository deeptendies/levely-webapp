import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../utils/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDoc, getDocs, Unsubscribe } from 'firebase/firestore';
import { auth } from '../../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { functions } from '../../utils/firebase';
import { httpsCallable } from "firebase/functions";
import { getAuth } from 'firebase/auth';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';



interface JobData {
    id: string;
    name: string;
    description: string;
    analysis?: string;
    rewrittenResume?: string;
    actions?: Action[];  // Using your Action interface here
}

interface Action {
    id?: string;
    action: string;
    notes?: string;  // Notes is optional
    date: string;
    finished: boolean;
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
    const [actions, setActions] = useState<Action[]>([]);



    useEffect(() => {
        if (user?.uid) {
            const unsubJobs = onSnapshot(collection(db, 'users', user.uid, 'jobs'), async (snapshot) => {
                const jobsPromises = snapshot.docs.map(async doc => {
                    const jobData = {
                        id: doc.id,
                        ...doc.data(),
                    } as JobData;

                    const actionSnapshot = await getDocs(collection(db, 'users', user.uid, 'jobs', doc.id, 'actions'));
                    const actions = actionSnapshot.docs.map(actionDoc => ({
                        id: actionDoc.id,
                        ...actionDoc.data(),
                    } as Action));

                    return {
                        ...jobData,
                        actions
                    };
                });

                const newJobs = await Promise.all(jobsPromises);
                setJobList(newJobs);
            });

            return () => {
                unsubJobs();
            };
        }
    }, [user]);

    useEffect(() => {
        let unsubActions: Unsubscribe;
        if (selectedJob && user?.uid) {
            unsubActions = onSnapshot(collection(db, 'users', user.uid, 'jobs', selectedJob.id, 'actions'), (snapshot) => {
                const newActions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Action));
                setActions(newActions);
            });
        }

        return () => {
            if (unsubActions) {
                unsubActions();
            }
        };
    }, [selectedJob, user]);

    const combinedJob = {
        ...selectedJob,
        actions: actions
    };

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
        if (selectedJob && user?.uid) {
            await deleteDoc(doc(db, 'users', user.uid, 'jobs', selectedJob.id));
            setSelectedJob(null);
            setShowForm(false);
        }
    };

    const handleSave = async () => {
        const jobData = {
            name: jobName,
            description: jobDescription,
            analysis: jobAnalysis,
            rewrittenResume: rewrittenResume,
            ...(selectedJob?.actions ? { actions: selectedJob.actions } : {})
        };

        if (user?.uid) {
            const userJobsCollection = collection(db, 'users', user.uid, 'jobs');

            if (selectedJob) {
                await updateDoc(doc(userJobsCollection, selectedJob.id), jobData);
            } else {
                await addDoc(userJobsCollection, jobData);
            }
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


    // where the issue come from
    useEffect(() => {
        if (user?.uid) {
            const unsubJobs = onSnapshot(collection(db, 'users', user.uid, 'jobs'), async (snapshot) => {
                const jobsPromises = snapshot.docs.map(async doc => {
                    const jobData = {
                        id: doc.id,
                        ...doc.data(),
                    } as JobData;

                    const actionSnapshot = await getDocs(collection(db, 'users', user.uid, 'jobs', doc.id, 'actions'));
                    const actions = actionSnapshot.docs.map(actionDoc => ({
                        id: actionDoc.id,
                        ...actionDoc.data(),
                    } as Action));

                    return {
                        ...jobData,
                        actions
                    };
                });

                const newJobs = await Promise.all(jobsPromises);
                setJobList(newJobs);
            });

            return () => {
                unsubJobs();
            };
        }
    }, [user]);




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

            const systemPrompt = "Based on the job description, rewrite the resume in a professional way. Try to make the resume more relavent to the job posting. the goal is to to bypass ATS filter.";
            const userPrompt = `resume= """${resumeText}""" \n\n job description:"""${jobDescription}"""`;

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

    const addNewAction = async () => {
        if (selectedJob && user?.uid) {
            const newAction = { action: '', date: new Date().toISOString().substring(0, 10), finished: false };
            await addDoc(collection(db, 'users', user.uid, 'jobs', selectedJob.id, 'actions'), newAction);
        }
    };

    const removeAction = async (actionId: string) => {
        if (selectedJob && user?.uid) {
            await deleteDoc(doc(db, 'users', user.uid, 'jobs', selectedJob.id, 'actions', actionId));
        }
    };

    const updateAction = async (actionId: string, field: keyof Action, value: string | boolean) => {
        if (selectedJob && user?.uid) {
            await updateDoc(doc(db, 'users', user.uid, 'jobs', selectedJob.id, 'actions', actionId), {
                [field]: value,
            });
        }
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(resumeText)
            .then(() => {
                alert('Rewritten resume copied to clipboard');
            })
            .catch(err => {
                alert('Failed to copy text: ' + err);
            });
    };

    return (

        <div className="container">
            {isLoading && (
                <div className="loading-popup">
                    <div className="loading-icon"></div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Levely Jobs Workbench</h2>
                <span>Logged in as {user ? user.email : "Loading..."}</span>
                <button className="btn btn-light text-dark ml-3" onClick={handleReturn}>Return</button>
            </div>

            <p>Manage your job descriptions and analyses here.</p>

            <div className="row">
                {/* Existing Columns */}
                <div className="col-2">
                    <h3 className="text-center">Job List</h3>
                    {/* <p className="text-center">Click to select a job for editing.</p> */}
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

                <div className="col-6">
                    <h3 className="text-center">Details</h3>
                    <p className="text-center">Edit the selected job or add a new one.</p>
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
                                <button className="btn btn-light text-dark" onClick={handleCopyClick}>Copy</button>
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

                {showForm && (
                    <div className="col-4">
                        <h5 className="text-center">Job Tracker</h5>
                        {selectedJob ? (
                            <div className="table-card">
                                <table className="table">
                                    <tbody>
                                        {actions.map((item, index) => (
                                            <React.Fragment key={`${item.id}-fragment`}>
                                                <tr key={`${item.id}-action`}>
                                                    <td colSpan={5}>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Action"
                                                            value={item.action}
                                                            onChange={(e) => updateAction(item.id!, 'action', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr key={`${item.id}-notes`}>
                                                    <td colSpan={5}>
                                                        <textarea
                                                            className="form-control"
                                                            rows={2}
                                                            placeholder="Notes"
                                                            value={item.notes || ""}
                                                            onChange={(e) => updateAction(item.id!, 'notes', e.target.value)}
                                                        ></textarea>
                                                    </td>
                                                </tr>
                                                <tr key={`${item.id}-date-finished`}>
                                                    <td>
                                                        <label>Finished:&nbsp;&nbsp;</label>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input large-checkbox"
                                                            checked={item.finished}
                                                            onChange={(e) => updateAction(item.id!, 'finished', e.target.checked)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <label>Date: </label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={item.date}
                                                            onChange={(e) => updateAction(item.id!, 'date', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-danger" onClick={() => removeAction(item.id!)}>-</button>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Select a job to see its actions.</p>
                        )}
                        <button className="btn btn-primary" onClick={addNewAction}>+</button>
                    </div>
                )}

            </div>
        </div>
    );

}
