import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const skillsRow1 = [
    'Java', 'JavaScript', 'Spring Boot', 'Spring MVC', 'Hibernate-ORM', 
    'Node.js', 'Express.js', 'ReactJS', 'HTML5', 'CSS3', 'Vite'
  ];
  
  const skillsRow2 = [
    'PostgreSQL', 'MySQL', 'MongoDB', 'REST API Design', 'MVC', 
    'CRUD', 'Agile/Scrum', 'Authentication (JWT)', 'RBAC', 'Git', 'Maven', 'Postman'
  ];

  return (
    <section className="about" id="about">
      <div className="about-content">
        <motion.h2 
          className="heading"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About <span>Me</span>
        </motion.h2>
        
        <motion.h3 
          className="about-role"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Full Stack Developer
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>
            I am a passionate Full Stack Developer with a strong engineering foundation (B.Tech CSE, 2025) from Bihar Engineering University and a track record of building scalable, user-centric web applications. With early roots in Computer Science Engineering, I constantly strive to bridge the gap between complex backend architectures and seamless frontend experiences.
          </p>

          <p>
            Through intensive hands-on roles as a Java Full Stack Trainee at JSpider and a Backend Development Intern at Robowaves, I have developed extensive expertise in architecting RESTful APIs, optimizing enterprise databases, and deploying dynamic cloud-native solutions. I thrive in agile environments where I can leverage my technical stack to write clean, maintainable code and deliver high-impact software.
          </p>

          <h4 className="tech-title">Tech Stack</h4>
          
          <div className="tech-container">
            <div className="scroller">
              <ul className="scroller-content">
                {skillsRow1.map((skill, index) => (
                  <li key={`r1-${index}`} className="tech-card">
                    {skill}
                  </li>
                ))}
              </ul>
              <ul className="scroller-content" aria-hidden="true">
                {skillsRow1.map((skill, index) => (
                  <li key={`r1-dup-${index}`} className="tech-card">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="scroller">
              <ul className="scroller-content reverse">
                {skillsRow2.map((skill, index) => (
                  <li key={`r2-${index}`} className="tech-card">
                    {skill}
                  </li>
                ))}
              </ul>
              <ul className="scroller-content reverse" aria-hidden="true">
                {skillsRow2.map((skill, index) => (
                  <li key={`r2-dup-${index}`} className="tech-card">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a href="#projects" className="btn">View Projects</a>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
