// NewProject.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewProject.module.scss';

const NewProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null); // Video file source for preview
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [timestamps, setTimestamps] = useState([]);
  const videoRef = useRef(null); // Reference to the video element
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setVideoSrc(fileURL);
      console.log('Video source updated:', fileURL); // Debugging statement
    }
  };

  // This useEffect hook reloads the video when the videoSrc state changes
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load(); // Ensures the video player reloads the new source
    }
  }, [videoSrc]);

  const handleSelectTimestamp = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const formattedTime = new Date(currentTime * 1000).toISOString().substr(11, 8); // Format as HH:MM:SS
      if (!timestamps.includes(formattedTime)) {
        setTimestamps([...timestamps, formattedTime]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bearer_token');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setFile(null);
        setError('');
        setStep(2); // Move to the timestamp selection step
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.log(err);
    }
  };

  const handleFinalize = () => {
    navigate('/home');
  };

  return (
    <div className={styles.NewProject}>
      {step === 1 && (
        <div className={styles.NewProjectContainer}>
          <h2 className={styles.Title}>Create New Project</h2>
          {error && <p className={styles.Error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.Form} encType="multipart/form-data">
            <div className={styles.FormGroup}>
              <label htmlFor="name" className={styles.Label}>Project Name</label>
              <input
                type="text"
                id="name"
                value={name}
                className={styles.InputField}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.FormGroup}>
              <label htmlFor="description" className={styles.Label}>Description</label>
              <textarea
                id="description"
                value={description}
                className={styles.InputField}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className={styles.FormGroup}>
              <label htmlFor="file" className={styles.Label}>Upload Video</label>
              <input
                type="file"
                id="file"
                className={styles.InputField}
                onChange={handleFileChange}
                accept="video/*"
              />
            </div>
            <button type="submit" className={styles.SubmitButton}>Create Project</button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className={styles.TimestampsContainer}>
          <h2 className={styles.Title}>Select Timestamps</h2>
          <video
            ref={videoRef}
            controls
            className={styles.VideoPlayer}
            src={videoSrc} // Ensure the video source is set here
            onLoadedData={() => console.log('Video loaded and ready to play')}
            onError={(e) => console.error('Error loading video', e)}
          >
            Your browser does not support the video tag.
          </video>
          <button onClick={handleSelectTimestamp} className={styles.SelectButton}>Select Timestamp</button>
          <ul className={styles.TimestampList}>
            {timestamps.map((ts, index) => (
              <li key={index} className={styles.TimeStampItem}>{ts}</li>
            ))}
          </ul>
          <button onClick={handleFinalize} className={styles.FinalizeButton}>Finalize</button>
        </div>
      )}
    </div>
  );
};

NewProject.propTypes = {};

export default NewProject;
