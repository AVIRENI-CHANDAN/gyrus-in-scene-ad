import React from 'react';
import { Link } from 'react-router-dom';
import util1 from './../images/util1.jpg';
import util2 from './../images/util2.jpg';
import util3 from './../images/util3.jpg';
import wave_bg from './../images/background-wave.jpg';
import styles from './LandingPage.module.scss';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = props.app_title;

    // Create refs for each section
    this.featuresRef = React.createRef();
    this.howItWorksRef = React.createRef();
  }

  // Method to handle smooth scroll to section
  scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  render() {
    return (
      <div className={styles.LandingPage}>
        <header className={styles.HeroSection} style={{
          backgroundImage: `url(${wave_bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <nav className={styles.Navbar}>
            <div className={styles.Logo}>{this.app_title}</div>
            <ul className={styles.NavLinks}>
              <li>
                <Link to="/" className={styles.NavLink}>Home</Link>
              </li>
              <li>
                <button onClick={() => this.scrollToSection(this.featuresRef)} className={styles.NavLink}>
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => this.scrollToSection(this.howItWorksRef)} className={styles.NavLink}>
                  How It Works
                </button>
              </li>
              <li>
                <Link to="/login" className={styles.NavLink}>Login</Link>
              </li>
              <li>
                <Link to="/register" className={styles.NavLink}>Register</Link>
              </li>
            </ul>
          </nav>
          <div className={styles.HeroContent}>
            <div className={styles.HeroContentWrapper}>
              <h1>Create <span>professional video</span> with ISAR 2D</h1>
              <p>Insert ads into videos based on object detection, seamlessly integrating them at the perfect timestamps and locations.</p>
              <Link to="login" className={styles.CtaButton}>Request Demo</Link>
            </div>
            <div className={styles.GyrusImageContainer}>
              <img src={util1} className={styles.IntroImage} alt="Gyrusutil1" draggable='false' />
              <img src={util2} className={styles.IntroImage} alt="Gyrusutil2" draggable='false' style={{ marginLeft: "6rem" }} />
              {/* <img src={gyrus_png} className={styles.IntroImage} alt="Gyrusutil2" draggable='false' /> */}
              <img src={util3} className={styles.IntroImage} alt="Gyrusutil3" draggable='false' />
            </div>
          </div>
        </header>

        <section ref={this.featuresRef} className={styles.FeaturesSection} id="features">
          <h2>Key Features</h2>
          <div className={styles.FeatureGrid}>
            <div className={styles.FeatureCard}>
              <h3>Timestamp-Based Placement</h3>
              <p>Accurate ad insertions at the required timestamps, ensuring maximum engagement and relevance.</p>
            </div>
            <div className={styles.FeatureCard}>
              <h3>Object Detection</h3>
              <p>Automatically detects objects within video frames to find ideal ad placement locations.</p>
            </div>
            <div className={styles.FeatureCard}>
              <h3>Non-Intrusive Integration</h3>
              <p>Blend ads into the content without disrupting viewer experience.</p>
            </div>
          </div>
        </section>

        <section ref={this.howItWorksRef} className={styles.HowItWorks} id="how-it-works">
          <h2>How It Works</h2>
          <div className={styles.StepsContainer}>
            <div className={styles.Step}>
              <h3>1. Upload Video</h3>
              <p>Start by uploading your video to the platform.</p>
            </div>
            <div className={styles.Step}>
              <h3>2. Set Preferences</h3>
              <p>Choose objects and timestamps where ads will appear.</p>
            </div>
            <div className={styles.Step}>
              <h3>3. Preview and Adjust</h3>
              <p>Preview the placement and make adjustments as needed.</p>
            </div>
            <div className={styles.Step}>
              <h3>4. Deploy</h3>
              <p>Launch your ad-embedded video to reach your audience effectively.</p>
            </div>
          </div>
        </section>

        <footer className={styles.Footer} id="contact">
          <p className={styles.FooterTitle}>&copy; 2024 {this.app_title}. All rights reserved.</p>
          <ul className={styles.SocialLinks}>
            <li><a href="https://linkedin.com/" className={styles.SocialLink}>LinkedIn</a></li>
            <li><a href="https://x.com/" className={styles.SocialLink}>Twitter</a></li>
          </ul>
        </footer>
      </div>
    );
  }
}

export default LandingPage;
