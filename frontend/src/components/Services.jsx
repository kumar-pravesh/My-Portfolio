import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Code, Users, Github } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Globe size={40} />,
      title: 'Web Development',
      description: 'Building responsive, modern websites using HTML, CSS, JavaScript, and Java. Creating fast, accessible, and SEO-friendly web applications.',
    },
    {
      icon: <Code size={40} />,
      title: 'Frontend & Backend Integration',
      description: 'Seamless integration of frontend interfaces with robust backend systems using Java, Spring Boot, and PostgreSQL for full-stack solutions.',
    },
    {
      icon: <Users size={40} />,
      title: 'Project Collaboration',
      description: 'Team projects, and real-time collaborative development. Building solutions together with fellow developers.',
    },
    {
      icon: <Github size={40} />,
      title: 'GitHub Profile Setup',
      description: 'Professional repository setup with clean documentation, proper README files, and organized project structures.',
    },
  ];

  return (
    <section className="services" id="services">
      <motion.div 
        className="services-header"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="heading">My <span>Services</span></h2>
        <p>Delivering comprehensive web development solutions tailored to your needs</p>
      </motion.div>

      <div className="services-container">
        {services.map((service, index) => (
          <motion.div 
            key={index} 
            className="service-card glass"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10, borderColor: 'var(--main-color)' }}
          >
            <div className="icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;
