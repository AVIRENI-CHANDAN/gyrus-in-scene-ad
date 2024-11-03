import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectList.module.scss';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.projects = [{ name: "Title1", description: "Description 1" }];
  }
  render() {
    return (
      <div className={styles.ProjectList}>
        <h3 className={styles.Title}>Your Projects</h3>
        <div className={styles.ListWrapper}>
          <ul className={styles.List}>
            {this.projects.map((project, index) => (
              <li key={index} className={styles.ProjectItem}>
                <h3 className={styles.ProjectName}>{project.name}</h3>
                <p className={styles.ProjectDescription}>{project.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/home/new/project" className={styles.CreateProjectButton} >
          Create New Project
        </Link>
      </div>
    );
  }
}

ProjectList.propTypes = {};

ProjectList.defaultProps = {};

export default ProjectList;
