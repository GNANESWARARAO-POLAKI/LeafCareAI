import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners'; // Import spinner

export const Chats: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const token: string | null = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const response = await fetch('https://leafcareai.vercel.app/backend/get_chats/', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat sessions');
        }

        const data = await response.json();
        setChatSessions(data.sessions);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchChatSessions();
  }, [token]);

  return (
    <div className="chat-container" style={{textAlign: 'center' }}>
      <h1>Previous Chats</h1>
      
      {loading ? (
        <div className="loading-container">
                    <ClipLoader size={50} color={"--navbar-bg"} loading={loading} />
                  </div>
      ) : chatSessions.length === 0 ? (
        <p>No previous chats found.</p>
      ) : (
        <ul className="chats-list">
          {chatSessions.map((session) => (
            <li key={session.id}>
              <Link to={`/chat/${session.id}`}>
                {session.session_name} - {new Date(session.created_at).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
