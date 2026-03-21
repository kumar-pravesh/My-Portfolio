import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Monitor, Activity, Users, ShoppingCart } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'SiviOn Global Technologies',
      image: '/sivion.jpg',
      description: 'A comprehensive corporate web portal serving as the face of SiviOn Global Technologies. Showcases services, company mission, and provides a streamlined interface for clients connecting with the firm.',
      status: 'Live',
      icon: <Monitor size={24} />,
      techStack: ['ReactJS', 'Tailwind CSS', 'Vercel'],
      liveLink: 'https://sivion-global-technologies.vercel.app/',
    },
    {
      title: 'Clinixa – HMS (Public Web)',
      image: '/clinixa-public.jpg',
      description: 'The public-facing portal for Clinixa Hospital Management System. Empowers patients to effortlessly discover hospital services, view specialized doctors, and engage with healthcare resources online.',
      status: 'Live',
      icon: <Activity size={24} />,
      techStack: ['ReactJS', 'Node.js', 'PostgreSQL', 'Render'],
      liveLink: 'https://clinixa-frontend-sage.vercel.app/',
    },
    {
      title: 'Clinixa – Staff Portal',
      image: '/clinixa-staff.jpg',
      description: 'A secure, role-based backend administrative interface. Enables hospital administration and medical staff to manage patient records securely, schedule appointments, and maintain clinical workflows.',
      status: 'Live',
      icon: <Users size={24} />,
      techStack: ['ReactJS', 'JWT', 'PostgreSQL', 'REST API'],
      liveLink: 'https://clinixa-staff-portal.vercel.app/login',
    },
    {
      title: 'Aapthi Marketing Solutions',
      image: '/aapthi.jpg',
      description: 'A dedicated platform for a digital marketing agency, built to showcase their portfolio of campaigns, lead generation strategies, and digital SEO services to prospective high-value clients.',
      status: 'Live',
      icon: <ShoppingCart size={24} />,
      techStack: ['ReactJS', 'CSS3', 'Vite', 'Vercel'],
      liveLink: 'https://aapthi-marketing-solutions.vercel.app/',
    }
  ];


  return (
    <section className="projects" id="projects">
      <div className="projects-header">
        <motion.h2 
          className="heading"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Latest <span>Projects</span>
        </motion.h2>
        <p>Explore my recent work and deployment links</p>
      </div>

      <div className="projects-container">
        {projects.map((project, index) => (
          <motion.div 
            className="project-card"
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="project-image-wrapper">
              <img src={project.image} alt={project.title} className="project-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400/122240/f5a623?text=Screenshot+Pending'; }} />
              <div className="status-badge" data-status={project.status.toLowerCase()}>{project.status}</div>
            </div>
            
            <div className="project-content-wrapper">
              <div className="icon-box">
                {project.icon}
              </div>
              
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              
              <div className="tags">
                {project.techStack.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
              
              <div className="project-links">
                <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={18} /> Live Demo
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
