import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectList.module.scss';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [], // State to hold the fetched projects
      error: null,  // State to handle potential errors
    };
  }

  componentDidMount() {
    // Replace with your method of retrieving the JWT token
    const token = localStorage.getItem('bearer_token');

    // Fetch projects from the API endpoint
    fetch('/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        return response.json();
      })
      .then(data => {
        this.setState({ projects: data });
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
        this.setState({ error: error.message });
      });
  }

  render() {
    const { projects, error } = this.state;

    return (
      <div className={styles.ProjectList}>
        <h3 className={styles.Title}>Your Projects</h3>
        {error && <p className={styles.Error}>{error}</p>}
        <div className={styles.ListWrapper}>
          <ul className={styles.List}>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <li key={index} className={styles.ProjectItem}>
                  <h3 className={styles.ProjectName}>{project.name}</h3>
                  <p className={styles.ProjectDescription}>{project.description}</p>
                </li>
              ))
            ) : (
              <p className={styles.NoProjects}>No projects found.</p>
            )}
          </ul>
        </div>
        <Link to="/home/new/project" className={styles.CreateProjectButton}>
          Create New Project
        </Link>
      </div>
    );
  }
}

ProjectList.propTypes = {};

ProjectList.defaultProps = {};

export default ProjectList;
