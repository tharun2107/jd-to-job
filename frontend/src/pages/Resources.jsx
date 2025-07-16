import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Resources = () => {
  const [jds, setJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch JDs and their skills/resources on mount
  useEffect(() => {
    axios.get('http://localhost:5001/api/jds', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    })
    .then(res => {
      setJds(res.data);
    })
    .catch(err => {
      console.error('Error fetching JDs:', err);
    });
  }, []);

  const handleJdSelect = jd => {
    setSelectedJd(jd);
  };

  // Use resources from selectedJd
  const resources = selectedJd?.resources || {};

  return (
    <div className="resources-root" style={{ maxWidth: 1100, margin: '0 auto', padding: 32, marginTop: 80, background: 'linear-gradient(135deg, #e3f2fd 0%, #f6f8fa 100%)', minHeight: '100vh', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(25,118,210,0.10)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 36, color: '#0d47a1', fontWeight: 900, letterSpacing: 1, fontSize: 36 }}>Learning Resources</h2>
      <section style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {jds.length === 0 ? (
          <div style={{ color: '#888', fontSize: 18 }}>No job descriptions found. Upload a JD to get started!</div>
        ) : (
          <>
            <label style={{ fontWeight: 700, marginBottom: 10, color: '#0d47a1', fontSize: 18 }}>Select a Job Description:</label>
            <div style={{ position: 'relative', width: 320 }}>
              <select
                value={selectedJd ? selectedJd._id : ''}
                onChange={e => {
                  const jd = jds.find(j => j._id === e.target.value);
                  handleJdSelect(jd);
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  minWidth: 320,
                  fontSize: 17,
                  border: '2px solid #1976d2',
                  background: 'rgba(255,255,255,0.7)',
                  color: '#0d47a1',
                  fontWeight: 600,
                  boxShadow: '0 2px 12px #90caf9',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ color: '#1976d2', background: '#e3f2fd', fontWeight: 600 }}>-- Select JD --</option>
                {jds.map(jd => (
                  <option key={jd._id} value={jd._id} style={{ color: '#0d47a1', background: '#e3f2fd', fontWeight: 600 }}>
                    {jd.title || jd.jdText.slice(0, 40)}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 18, top: 18, pointerEvents: 'none', color: '#1976d2', fontSize: 18 }}>▼</span>
            </div>
          </>
        )}
      </section>
      <AnimatePresence>
        {selectedJd && (
          <motion.section
            key="skills-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 36, background: 'rgba(227,242,253,0.7)', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px #90caf9', border: '1.5px solid #90caf9', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}
          >
            <strong style={{ color: '#0d47a1', fontSize: 18 }}>Skills for this JD:</strong>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: 0, padding: 0, listStyle: 'none', marginTop: 8 }}>
              {(selectedJd.skills || []).map(skill => (
                <li key={skill} style={{ background: 'rgba(25,118,210,0.85)', color: '#fff', borderRadius: 10, padding: '6px 18px', fontSize: 16, fontWeight: 700, letterSpacing: 0.5, boxShadow: '0 2px 8px #90caf9' }}>{skill}</li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ color: '#0d47a1', fontWeight: 800, fontSize: 26, marginBottom: 18, letterSpacing: 0.5, textAlign: 'center' }}>Skill-wise Curated Resources</h3>
        <div className="resources-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 36, justifyContent: 'center' }}>
          <AnimatePresence>
            {Object.entries(resources).map(([skill, { articles, videos }], idx) => (
              <motion.div
                className="resource-card glassmorphic"
                key={skill}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 8px 32px 0 rgba(25,118,210,0.18)',
                  borderRadius: 22,
                  padding: 28,
                  minWidth: 320,
                  flex: '1 1 360px',
                  marginBottom: 28,
                  border: '1.5px solid #90caf9',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 12px 36px 0 #1976d2aa' }}
              >
                <h4 style={{ color: '#1976d2', marginBottom: 14, fontWeight: 800, letterSpacing: 0.5, fontSize: 22 }}>{skill}</h4>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#0d47a1' }}>Articles:</strong>
                  {(!articles || articles.length === 0) ? (
                    <div style={{ color: '#888', fontStyle: 'italic', marginTop: 4 }}>No articles found for this skill.</div>
                  ) : (
                    <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                      {(articles || []).map((a, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                          <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600, fontSize: 15 }}>{a.title}</a>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <strong style={{ color: '#0d47a1' }}>Videos:</strong>
                  {(!videos || videos.length === 0) ? (
                    <div style={{ color: '#888', fontStyle: 'italic', marginTop: 4 }}>No YouTube videos found for this skill.</div>
                  ) : (
                    <div className="video-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                      <AnimatePresence>
                        {(videos || []).map((v, i) => (
                          <motion.a
                            key={i}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ delay: 0.15 + i * 0.07 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none',
                              background: 'rgba(25, 118, 210, 0.08)',
                              borderRadius: 10,
                              padding: '7px 10px',
                              marginBottom: 2,
                              transition: 'background 0.18s, box-shadow 0.18s',
                              boxShadow: '0 2px 8px 0 rgba(25,118,210,0.07)',
                            }}
                            whileHover={{ background: 'rgba(25, 118, 210, 0.18)', scale: 1.03, boxShadow: '0 4px 16px #1976d2aa' }}
                          >
                            <img src={v.thumbnail} alt={v.title} width={80} height={48} style={{ borderRadius: 6, border: '1px solid #90caf9', objectFit: 'cover', background: '#e3f2fd' }} />
                            <span style={{ color: '#0d47a1', fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>{v.title}</span>
                          </motion.a>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedJd && Object.keys(resources).length === 0 && <div style={{ color: '#888', fontStyle: 'italic', marginTop: 24 }}>No resources found for this JD's skills.</div>}
        </div>
      </section>
    </div>
  );
};

export default Resources; 