import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Image from 'next/image'; // Import Image from Next.js
import styles from '@/styles/Home.module.css'; // Import the styles

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('auth');
        if (!token) {
            router.push('/');
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('auth');
        router.push('/');
    };

    const goToUploadResume = () => {
        router.push('/uploadResume');  // Assuming the UploadResume page is at this route
    };

    const goToJobsWorkbench = () => {
        router.push('/jobsWorkbench');  // Assuming the JobsWorkbench page is at this route
    };


    return (
        <>
            <main className={`d-flex justify-content-center align-items-center vh-100 ${styles.unselectable}`}>
                <div className="text-center">
                    <Image
                        src="/logo.png"
                        alt="Levely Logo"
                        width={150}
                        height={150}
                    />
                    <h1>Your Account</h1>
                    <p>Welcome to your dashboard!</p>
                    <div className="btn-group-vertical">
                        <button className="btn btn-light text-dark mb-2" onClick={goToUploadResume}>Upload Resume</button>
                        <button className="btn btn-light text-dark mb-2" onClick={goToJobsWorkbench}>Jobs Workbench</button>
                        <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
            </main>
        </>
    );
}
