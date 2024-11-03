// NewProject.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import styles from './NewProject.module.scss';

const NewProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null); // State to hold the selected file
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bearer_token');

      // Create a FormData object to hold the form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (file) {
        formData.append('file', file); // Append the file to the form data
      }

      const response = await fetch('/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT token here
        },
        body: formData, // Use formData as the body for the request
      });

      if (response.ok) {
        const data = await response.json();
        setName('');
        setDescription('');
        setFile(null); // Reset the file input
        setError('');
        navigate('/home'); // Redirect to "/home" on success
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.log(err);
    }
  };

  return (
    <div className={styles.NewProject}>
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
            <label htmlFor="file" className={styles.Label}>Upload File</label>
            <input
              type="file"
              id="file"
              className={styles.InputField}
              onChange={handleFileChange}
            />
          </div>
          <button type="submit" className={styles.SubmitButton}>Create Project</button>
        </form>
      </div>
    </div>
  );
};

NewProject.propTypes = {};

export default NewProject;
