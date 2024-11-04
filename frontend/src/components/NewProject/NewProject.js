// Continuation of NewProject.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewProject.module.scss';

const NewProject = () => {
  // Existing state and hooks
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [timestamps, setTimestamps] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState({}); // Stores points for each timestamp
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const videoRef = useRef(null); // Reference to the video element
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setVideoSrc(fileURL);
      console.log('Video source updated:', fileURL);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load(); // Ensures the video player reloads the new source
    }
  }, [videoSrc]);

  const handleSelectTimestamp = () => {
    if (videoRef.current) {
      const { currentTime } = videoRef.current;
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
      }).then(response => {
        if (response.ok) {
          setName('');
          setDescription('');
          setError('');
          setStep(2); // Move to the timestamp selection step
          return response.json();
        } else {
          setError('Failed to create project. Please try again.');
        }
      }).then(data => {
        console.log("Data", data);
        setFile(data.filename)
      })

    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.log(err);
    }
  };

  const handleFinalizeTimestamps = () => {
    setStep(3); // Move to step 3 for selecting points in the video
  };

  const handleSelectPoint = (e) => {
    const rect = videoRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Calculate X as a percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Calculate Y as a percentage

    if (currentTimestamp) {
      const points = selectedPoints[currentTimestamp] || [];
      if (points.length < 4) {
        setSelectedPoints({
          ...selectedPoints,
          [currentTimestamp]: [...points, { x, y }],
        });
      }
    }
  };

  const handleSelectTimestampForPoints = (timestamp) => {
    setCurrentTimestamp(timestamp);
    if (videoRef.current) {
      const [hours, minutes, seconds] = timestamp.split(':').map(Number);
      const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.pause(); // Pause the video to display the frame
    }
  };

  const handleFinalize = async () => {
    try {
      const formData = new FormData();

      // Extract the file name from the file
      if (file) {
        const fileName = file.split('/').pop(); // Extract the last part of the URL
        formData.append('video_filename', fileName);
      } else {
        setError('No video source available.');
        return;
      }

      // Prepare timestamps and points data as a JSON string with converted timestamps
      const dataToSend = timestamps.map(ts => {
        const [hours, minutes, seconds] = ts.split(':').map(Number);
        const timeInSeconds = hours * 3600 + minutes * 60 + seconds; // Convert to seconds
        return {
          timestamp: timeInSeconds.toFixed(2), // Ensure it's a float
          points: selectedPoints[ts] || [],
        };
      });

      formData.append('timestamps', JSON.stringify(dataToSend));

      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/process_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Video processed successfully:', result);
        navigate('/home');
      } else {
        const errorData = await response.json();
        console.error('Error processing video:', errorData);
        setError('Failed to process video. Please try again.');
      }
    } catch (err) {
      console.error('Failed to process video:', err);
      setError('An error occurred. Please try again.');
    }
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
            src={videoSrc}
            onClick={handleSelectTimestamp}
          >
            Your browser does not support the video tag.
          </video>
          <button onClick={handleSelectTimestamp} className={styles.SelectButton}>Select Timestamp</button>
          <ul className={styles.TimestampList}>
            {timestamps.map((ts, index) => (
              <li key={index} className={styles.TimestampItem} onClick={() => setCurrentTimestamp(ts)}>{ts}</li>
            ))}
          </ul>
          <button onClick={handleFinalizeTimestamps} className={styles.FinalizeButton}>Finalize Timestamps</button>
        </div>
      )}

      {step === 3 && (
        <div className={styles.PointSelectionContainer}>
          <h2 className={styles.Title}>Select Points for Each Timestamp</h2>
          <p>Select a timestamp to place points:</p>
          <ul className={styles.TimestampList}>
            {timestamps.map((ts, index) => (
              <li
                key={index}
                className={styles.TimestampItem}
                onClick={() => handleSelectTimestampForPoints(ts)}
              >
                {ts}
              </li>
            ))}
          </ul>
          {currentTimestamp && <p>Current Timestamp: {currentTimestamp}</p>}
          <video
            ref={videoRef}
            className={styles.VideoPlayer}
            src={videoSrc}
            onClick={handleSelectPoint}
            controls={false} // Remove controls to prevent playback during point selection
          >
            Your browser does not support the video tag.
          </video>
          <ul className={styles.PointsList}>
            {(selectedPoints[currentTimestamp] || []).map((point, index) => (
              <li key={index} className={styles.PointItem}>Point {index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})</li>
            ))}
          </ul>
          {currentTimestamp && selectedPoints[currentTimestamp]?.length < 4 && (
            <p>Click on the video to select up to 4 points for the current timestamp.</p>
          )}
          <button onClick={handleFinalize} className={styles.FinalizeButton}>Finalize and Send to Backend</button>
        </div>
      )}
    </div>
  );
};

NewProject.propTypes = {};

export default NewProject;
