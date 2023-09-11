import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/utils/firebase';

interface Message {
    message: string;
    sender: string; // 'me' for user, 'GPT4' for bot
}

export default function Chat() {
    const [message, setMessage] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getLastThreeMessages = () => {
        // Assuming chatMessages keeps the dialogue history
        const lastThree = chatMessages.slice(-3);
        return lastThree.map(m => `${m.sender}: ${m.message}`).join('\n');
    };

    const sendMessage = async () => {
        if (message) {
            setIsLoading(true);

            const userMessage: Message = {
                message: message,
                sender: 'me'
            };
            setChatMessages([...chatMessages, userMessage]);

            try {
                // Initialize the function
                const callOpenAI = httpsCallable(functions, 'openAI');

                const lastThree = getLastThreeMessages();

                // Your system and user prompt logic here
                const systemPrompt = ``;
                const userPrompt = `${lastThree}\n${message}`;

                const result = await callOpenAI({ system: systemPrompt, user: userPrompt, model: "gpt-4", max_tokens: 4000 });

                const data = result.data as any;
                if (data && data.response && data.response.choices && data.response.choices.length > 0) {
                    const botMessage = {
                        message: data.response.choices[0].message.content,
                        sender: 'GPT4'
                    };
                    setChatMessages([...chatMessages, userMessage, botMessage]);
                } else {
                    console.error("Unexpected structure in result: ", result);
                }

            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
                setMessage('');
            }
        }
    };

    const downloadChat = () => {
        const chatText = chatMessages.map(msg => `${msg.sender}: ${msg.message}`).join('\n');
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat.txt';
        a.click();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid black',
            padding: '20px'
        }}>
            <div className="flex-grow-1 overflow-auto">
                {chatMessages.map((msg, index) => (
                    <div key={index}>
                        <p>{msg.sender}: {msg.message}</p>
                    </div>
                ))}
            </div>
            <div className="mt-auto" style={{ width: '100%' }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-control"
                    placeholder="Type a message"
                    style={{ width: '100%', height: '100px' }}
                />
                <div className="d-flex mt-2">
                    <button className="btn btn-primary" style={{ width: '10%', margin: '0 10px' }} onClick={sendMessage}>
                        Send
                    </button>
                    <button className="btn btn-secondary" style={{ width: '15%' }} onClick={downloadChat}>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}