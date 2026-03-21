import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Github, Linkedin } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:praveshkumar5502@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="contact" id="contact">
      <motion.div 
        className="contact-header"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="heading">Contact <span>Me!</span></h2>
        <p>Have a project in mind? Let's work together to bring your ideas to life</p>
      </motion.div>

      <div className="contact-container">
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3>Get in Touch</h3>
          <p>
            I'm always open to discussing new projects, creative ideas, or 
            opportunities to be part of your vision. Feel free to reach out!
          </p>

          <div className="info-list">
            <div className="info-item">
              <div className="icon-box"><Mail size={20} /></div>
              <div>
                <span>Email</span>
                <strong>praveshkumar5502@gmail.com</strong>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><Phone size={20} /></div>
              <div>
                <span>Phone</span>
                <strong>+91 9128521727</strong>
              </div>
            </div>

            <div className="info-item">
              <div className="icon-box"><MapPin size={20} /></div>
              <div>
                <span>Location</span>
                <strong>Banka, Bihar, India</strong>
              </div>
            </div>
          </div>

          <div className="social-links">
            <a href="https://github.com/kumar-pravesh" target="_blank" rel="noopener noreferrer"><Github size={22} /></a>
            <a href="https://www.linkedin.com/in/pravesh-kumar-38b1422a7" target="_blank" rel="noopener noreferrer"><Linkedin size={22} /></a>
            <a href="mailto:praveshkumar5502@gmail.com"><Mail size={22} /></a>
          </div>
        </motion.div>

        <motion.div 
          className="contact-form"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--main-color)' }}>
              <Send size={48} style={{ marginBottom: '1rem' }} />
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. I'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              </div>

              <textarea name="message" placeholder="Tell me about your project..." value={form.message} onChange={handleChange} required></textarea>

              <button type="submit" className="btn">
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>

    </section>
  );
};

export default Contact;
