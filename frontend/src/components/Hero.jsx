import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        'Java Full Stack Developer',
        'Spring Boot Developer',
        'React JS Developer',
        'REST API Developer',
        'Backend Developer',
      ],
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 1200,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <section className="home" id="home">
      <motion.div
        className="home-content"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <h3>Hello, It's Me</h3>
        <h1>Pravesh Kumar</h1>
        <h3>
          And I'm a <span><span ref={el}></span></span>
        </h3>
        <p>
          Result-oriented Java Full Stack Developer with hands-on experience designing, developing, and deploying end-to-end web applications in production. Proficient in building RESTful APIs and robust backend systems using Spring Boot, Hibernate/JPA, and PostgreSQL, paired with dynamic frontend interfaces using ReactJS, HTML5, and CSS3. Experienced in implementing role-based access control (RBAC), database optimization, exception handling, and CORS management. Delivered multiple live projects demonstrating strong problem-solving ability, clean code practices, and effective collaboration in agile development environments.
        </p>
        <div className="social-media">
          <a href="https://github.com/kumar-pravesh" target="_blank" rel="noopener noreferrer">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/pravesh-kumar-38b1422a7" target="_blank" rel="noopener noreferrer">
            <Linkedin size={20} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a
            href="/assets/PK.pdf"
            className="btn btn-light"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download CV
          </a>
          <a href="#projects" className="btn">View Projects</a>
        </div>
      </motion.div>

      <motion.div
        className="home-img"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <img src="/images/profile.png" alt="Profile" />
      </motion.div>
    </section>
  );
};

export default Hero;
