import React, { useState } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DetectedDisease } from '../types';

export const Upload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<DetectedDisease | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleStartChat = async () => {
    if (!image) {
      setError("Please upload an image before starting a chat.");
      return;
    }
  
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found!");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("image", image);
  
      const response = await fetch("https://leafcareai.vercel.app/backend/start_chat_session/", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to create chat session.");
      }
  
      const data = await response.json();
      console.log("Chat session created:", data);
  
      navigate(`/chat/${data.session_id}`); // Redirect to chat page with session ID
  
    } catch (error) {
      console.error("Error starting chat session:", error);
      setError("Failed to start chat session. Please try again.");
    }
  };
  
  const processFile = async (file: File) => {
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Invalid file type! Please upload a JPG, JPEG, or PNG image.");
      setImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setImage(reader.result as string);
      setError('');
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found!");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("http://127.0.0.1:8000/backend/detect_leaf/", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          setError("Detection Failed Due to server error");
          setImage(null);
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Upload successful:", data);
        setResult({
          is_leaf: data.leaf_detected,
          detected: true,
          name: data.disease_name,
          confidence: data.confidence,
          description: "",
          message: data.message,
        });

      } catch (error) {
        console.error("Error uploading file:", error);
        setError("Something went wrong. Please try again.");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResult(null); 
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setResult(null);       
      processFile(file);
    }
  };

  return (
    <div className="container">
      <div className="upload-section">
        <h1>Upload Leaf Image</h1>
        <p>Upload a clear photo of the affected leaf for analysis</p>

        <div
          className={`upload-container ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {image ? (
            <div className="result-container">
              <img src={image} alt="Uploaded leaf" className="uploaded-image" />
              {result ? (
                <div className="disease-result">
                  {result.is_leaf ? (
                    <>
                      <h2>{result.name}</h2>
                      <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
                      <p>{result.description}</p>
                      <div className='buttons-flex'>
                        <label className="button">
                          Reupload
                          <input type="file" hidden accept="image/*" onChange={handleFileInput} />
                        </label>
                        <button className="button" onClick={handleStartChat}>
                          Chat with AI 
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ color: "red", textAlign: 'center' }}>{result.message}</h3>
                      <label className="button">
                        Reupload
                        <input type="file" hidden accept="image/*" onChange={handleFileInput} />
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <p>Analyzing image...</p>
              )}
            </div>
          ) : (
            <>
              <UploadIcon className="upload-icon" />
              <p>Drag and drop your image here, or click to select</p>
              <label className="button">
                Select Image
                <input type="file" hidden accept="image/*" onChange={handleFileInput} />
              </label>
            </>
          )}
        </div>
      </div>
      {error && <h3 style={{ color: "red", textAlign: 'center' }}>{error}</h3>}
    </div>
  );
};
