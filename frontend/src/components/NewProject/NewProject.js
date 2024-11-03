// NewProject.js
import React, { useState } from 'react';
import styles from './NewProject.module.scss';

const NewProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with how you retrieve the JWT token (e.g., from localStorage)
      const token = localStorage.getItem('bearer_token');

      const response = await fetch('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the JWT token here
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const data = await response.json();
        setName('');
        setDescription('');
        setError('');
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
        <form onSubmit={handleSubmit} className={styles.Form}>
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
          <button type="submit" className={styles.SubmitButton}>Create Project</button>
        </form>
      </div>
    </div>
  );
};

NewProject.propTypes = {};

export default NewProject;
