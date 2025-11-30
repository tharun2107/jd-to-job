import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Skills from './Skills';
import Education from './Education';
import Projects from './Projects';

const getToken = () => localStorage.getItem('token');

// Template definitions
const TEMPLATES = [
  { id: 'classic', name: 'Classic ATS', description: 'Simple, clean format', preview: '📄', hasPhoto: false, color: '#111' },
  { id: 'professional', name: 'Professional Blue', description: 'Modern with photo', preview: '💼', hasPhoto: true, color: '#0066cc' },
  { id: 'modern', name: 'Modern Minimal', description: 'Clean minimal design', preview: '✨', hasPhoto: false, color: '#2563eb' },
  { id: 'executive', name: 'Executive', description: 'Executive style with photo', preview: '👔', hasPhoto: true, color: '#1e3a5f' }
];

const initialForms = {
  experience: { company: '', role: '', duration: '', details: [''] },
  projects: { title: '', link: '', description: [''] },
  education: { degree: '', institution: '', year: '', cgpa: '' },
  certifications: { name: '' },
  achievements: { point: '' },
  hobbies: { point: '' },
};

function PointsInput({ points, setPoints }) {
  const handleChange = (i, v) => {
    const newPoints = [...points];
    newPoints[i] = v;
    setPoints(newPoints);
  };
  const handleAdd = () => setPoints([...points, '']);
  const handleRemove = (i) => setPoints(points.filter((_, idx) => idx !== i));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {points.map((pt, i) => (
        <div key={i} style={{ display: 'flex', gap: 4 }}>
          <input value={pt} onChange={e => handleChange(i, e.target.value)} style={{ flex: 1, padding: '6px' }} />
          {points.length > 1 && <button type="button" onClick={() => handleRemove(i)} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>-</button>}
        </div>
      ))}
      <button type="button" onClick={handleAdd} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', marginTop: 2, alignSelf: 'flex-start' }}>Add Point</button>
    </div>
  );
}

function SectionList({ sectionKey, title, items, onAdd, onEdit, onDelete, renderItem, addLabel, emptyLabel }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(initialForms[sectionKey] || {});
  const [points, setPoints] = useState(form.description || form.details || ['']);
  React.useEffect(() => {
    if (editingIndex !== null) {
      setForm(items[editingIndex]);
      setPoints(items[editingIndex].description || items[editingIndex].details || ['']);
    } else {
      setForm(initialForms[sectionKey] || {});
      setPoints(['']);
    }
    // eslint-disable-next-line 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingIndex]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEdit = (idx) => setEditingIndex(idx);
  const handleEditSave = (e) => {
    e.preventDefault();
    let updated = { ...form };
    if (sectionKey === 'projects') updated.description = points;
    else if (sectionKey === 'experience') updated.details = points;
    else if (sectionKey === 'achievements' || sectionKey === 'hobbies') updated.point = points;
    onEdit(editingIndex, updated);
    setEditingIndex(null);
    setForm(initialForms[sectionKey] || {});
    setPoints(['']);
  };
  const handleAddSave = (e) => {
    e.preventDefault();
    let toAdd = { ...form };
    if (sectionKey === 'projects') toAdd.description = points;
    else if (sectionKey === 'experience') toAdd.details = points;
    else if (sectionKey === 'achievements' || sectionKey === 'hobbies') toAdd.point = points;
    const hasValue = Object.values(toAdd).some(v => Array.isArray(v) ? v.some(x => x && x.trim() !== '') : v && v.trim() !== '');
    if (hasValue) {
      onAdd(toAdd);
      setForm(initialForms[sectionKey] || {});
      setPoints(['']);
    }
  };
  const handleCancel = () => {
    setEditingIndex(null);
    setForm(initialForms[sectionKey] || {});
    setPoints(['']);
  };
  return (
    <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
      <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>{title}</legend>
      <ul style={{ padding: 0, listStyle: 'none', marginBottom: '1rem' }}>
        {items.length === 0 && <li style={{ color: '#888' }}>{emptyLabel}</li>}
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem', background: '#f3f4fa', padding: '0.5rem', borderRadius: '6px' }}>
            {editingIndex === idx ? (
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {renderItem(form, handleChange, points, setPoints)}
                <div>
                  <button type="submit" style={{ marginRight: 8, background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={handleCancel} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{renderItem(item)}</div>
                <div>
                  <button onClick={() => handleEdit(idx)} style={{ marginRight: 8, background: '#e0e7ff', color: '#3b5bdb', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(idx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editingIndex === null && (
        <form onSubmit={handleAddSave} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {renderItem(form, handleChange, points, setPoints)}
          <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', alignSelf: 'flex-start' }}>{addLabel}</button>
        </form>
      )}
    </fieldset>
  );
}

function App() {
  const [resume, setResume] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      links: [], // Array of { label: '', url: '' }
    },
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    hobbies: [],
    customSections: [],
  });
  const [skillsGroups, setSkillsGroups] = useState([]);
  const [customSectionTitle, setCustomSectionTitle] = useState("");
  const [customSectionItem, setCustomSectionItem] = useState("");
  const previewRef = useRef();
  const previewScrollRef = useRef();
  const [previewZoom, setPreviewZoom] = useState(100);

  // Template and save states
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savedResumes, setSavedResumes] = useState([]);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);

  // Header links state for add/edit
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [editingLinkIdx, setEditingLinkIdx] = useState(null);

  // Fetch saved resumes on mount
  useEffect(() => {
    fetchSavedResumes();
  }, []);

  const fetchSavedResumes = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get('http://localhost:5001/api/resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedResumes(res.data.resumes || []);
    } catch (err) {
      console.error('Error fetching saved resumes:', err);
    }
  };

  const handleSaveResume = async () => {
    if (!resumeName.trim()) {
      alert('Please enter a name for your resume');
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const data = { name: resumeName, template: selectedTemplate, photoUrl, resumeData: resume, skillsGroups };
      let res;
      if (currentResumeId) {
        res = await axios.put(`http://localhost:5001/api/resumes/${currentResumeId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post('http://localhost:5001/api/resumes', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentResumeId(res.data.resume._id);
      }
      fetchSavedResumes();
      alert('Resume saved successfully!');
    } catch (err) {
      console.error('Error saving resume:', err);
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadResume = async (resumeId) => {
    try {
      const token = getToken();
      const res = await axios.get(`http://localhost:5001/api/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const saved = res.data.resume;
      setResume(saved.resumeData);
      setSkillsGroups(saved.skillsGroups || []);
      setSelectedTemplate(saved.template || 'classic');
      setPhotoUrl(saved.photoUrl || '');
      setResumeName(saved.name);
      setCurrentResumeId(saved._id);
      setShowSavedList(false);
    } catch (err) {
      console.error('Error loading resume:', err);
      alert('Failed to load resume');
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5001/api/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSavedResumes();
      if (currentResumeId === resumeId) {
        setCurrentResumeId(null);
        setResumeName('');
      }
    } catch (err) {
      alert('Failed to delete resume');
    }
  };

  const handleNewResume = () => {
    setResume({
      personalInfo: { name: "", email: "", phone: "", links: [] },
      summary: "", skills: [], experience: [], projects: [],
      education: [], certifications: [], achievements: [], hobbies: [], customSections: [],
    });
    setSkillsGroups([]);
    setCurrentResumeId(null);
    setResumeName('');
    setPhotoUrl('');
    setShowSavedList(false);
  };

  // Compress image before storing
  const compressImage = (file, maxWidth = 200, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress to ~200x200 with 70% quality
        const compressedUrl = await compressImage(file, 200, 0.7);
        setPhotoUrl(compressedUrl);
        console.log('Photo compressed, size:', Math.round(compressedUrl.length / 1024), 'KB');
      } catch (err) {
        console.error('Error compressing image:', err);
        // Fallback to original
        const reader = new FileReader();
        reader.onloadend = () => setPhotoUrl(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const currentTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  // Handlers for basic fields
  const handlePersonalInfoChange = (e) => {
    setResume({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [e.target.name]: e.target.value,
      },
    });
  };
  const handleSummaryChange = (e) => {
    setResume({ ...resume, summary: e.target.value });
  };
  const handleAddLink = (e) => {
    e.preventDefault();
    if (linkLabel.trim() && linkUrl.trim()) {
      setResume(r => ({
        ...r,
        personalInfo: {
          ...r.personalInfo,
          links: [...r.personalInfo.links, { label: linkLabel.trim(), url: linkUrl.trim() }],
        },
      }));
      setLinkLabel("");
      setLinkUrl("");
    }
  };
  const handleEditLink = (idx) => {
    setEditingLinkIdx(idx);
    setLinkLabel(resume.personalInfo.links[idx].label);
    setLinkUrl(resume.personalInfo.links[idx].url);
  };
  const handleSaveLink = (e) => {
    e.preventDefault();
    setResume(r => ({
      ...r,
      personalInfo: {
        ...r.personalInfo,
        links: r.personalInfo.links.map((l, i) => i === editingLinkIdx ? { label: linkLabel.trim(), url: linkUrl.trim() } : l),
      },
    }));
    setEditingLinkIdx(null);
    setLinkLabel("");
    setLinkUrl("");
  };
  const handleDeleteLink = (idx) => {
    setResume(r => ({
      ...r,
      personalInfo: {
        ...r.personalInfo,
        links: r.personalInfo.links.filter((_, i) => i !== idx),
      },
    }));
    setEditingLinkIdx(null);
    setLinkLabel("");
    setLinkUrl("");
  };

  // Section handlers
  const addSectionItem = (section, item) => setResume({ ...resume, [section]: [...resume[section], item] });
  const editSectionItem = (section, idx, item) => setResume({ ...resume, [section]: resume[section].map((it, i) => (i === idx ? item : it)) });
  const deleteSectionItem = (section, idx) => setResume({ ...resume, [section]: resume[section].filter((_, i) => i !== idx) });

  // Achievements/Hobbies handlers
  const addPointSection = (section, points) => setResume({ ...resume, [section]: [...resume[section], ...points.filter(p => p && p.trim() !== '').map(point => ({ point }))] });
  const editPointSection = (section, idx, item) => setResume({ ...resume, [section]: resume[section].map((it, i) => (i === idx ? item : it)) });
  const deletePointSection = (section, idx) => setResume({ ...resume, [section]: resume[section].filter((_, i) => i !== idx) });

  // Custom section handlers
  const handleAddCustomSection = (e) => {
    e.preventDefault();
    if (customSectionTitle.trim()) {
      setResume({
        ...resume,
        customSections: [...resume.customSections, { title: customSectionTitle, items: [customSectionItem].filter(Boolean) }],
      });
      setCustomSectionTitle("");
      setCustomSectionItem("");
    }
  };

  // PDF Download (robust)
  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (previewRef.current) {
      // Save current zoom and reset to 100% for export
      const currentZoom = previewZoom;
      setPreviewZoom(100);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = previewRef.current;
      
      await html2pdf().from(element).set({
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `${resume.personalInfo.name || "resume"}_${selectedTemplate}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).save();
      
      // Restore zoom
      setPreviewZoom(currentZoom);
    } else {
      alert("Preview not found!");
    }
  };

  // ATS-friendly preview styles
  const sectionHeader = { fontWeight: 700, fontSize: '1.1rem', color: '#111', borderBottom: '1px solid #bbb', margin: '0.7em 0 0.3em 0', letterSpacing: '0.5px' };
  const label = { fontWeight: 700, color: '#111' };
  const dateStyle = { float: 'right', color: '#444', fontSize: '0.98rem', fontWeight: 400 };
  const bulletList = { margin: '0.2em 0 0.7em 1.2em', padding: 0, color: '#222', fontSize: '1.01rem' };
  const bullet = { marginBottom: '0.2em', listStyle: 'disc' };
  const contactLink = { color: '#0645AD', textDecoration: 'underline', margin: '0 0.3em' };

  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);

  // Just before the preview rendering:
  const normalizedProjects = (resume.projects || []).map(p => ({
    ...p,
    techStack: Array.isArray(p.techStack) ? p.techStack : (p.techStack ? [p.techStack] : []),
    links: Array.isArray(p.links) ? p.links : (p.links ? [p.links] : []),
    description: Array.isArray(p.description) ? p.description : (p.description ? [p.description] : []),
  }));

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '1rem' }}>
      {/* Top Bar */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setShowSavedList(!showSavedList)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          📂 My Resumes ({savedResumes.length})
        </button>
        <button onClick={handleNewResume} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          ➕ New
        </button>
      </div>

      {/* Saved Resumes List */}
      {showSavedList && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 1rem', background: '#1e293b', borderRadius: 12, padding: '1rem' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>Your Saved Resumes</h3>
          {savedResumes.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No saved resumes. Create one and save it!</p>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {savedResumes.map(r => (
                <div key={r._id} style={{ background: '#334155', borderRadius: 8, padding: '1rem', minWidth: 200, border: currentResumeId === r._id ? '2px solid #3b82f6' : 'none' }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(r.updatedAt).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => handleLoadResume(r._id)} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteResume(r._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Selection with Visual Previews */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 1rem', background: '#1e293b', borderRadius: 12, padding: '1rem 1.5rem' }}>
        <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📋 Select Resume Template</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Classic Template Preview */}
          <div onClick={() => setSelectedTemplate('classic')} style={{
            background: selectedTemplate === 'classic' ? '#2563eb' : '#334155',
            borderRadius: 8, padding: '0.75rem', cursor: 'pointer', width: '140px',
            border: selectedTemplate === 'classic' ? '3px solid #60a5fa' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div style={{ background: '#fff', borderRadius: 4, height: '100px', padding: '8px', marginBottom: '0.5rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 4, marginBottom: 4 }}>
                <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '1px' }}>JOHN DOE</div>
                <div style={{ fontSize: '5px', color: '#666' }}>email@mail.com | 123-456</div>
              </div>
              <div style={{ fontSize: '5px', fontWeight: 600, borderBottom: '1px solid #ccc', marginBottom: 2 }}>PROFILE</div>
              <div style={{ fontSize: '4px', color: '#444', marginBottom: 3 }}>Professional summary text here...</div>
              <div style={{ fontSize: '5px', fontWeight: 600, borderBottom: '1px solid #ccc', marginBottom: 2 }}>EDUCATION</div>
              <div style={{ fontSize: '4px', color: '#444' }}>University Name • Degree</div>
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Classic ATS</div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center' }}>Simple & Clean</div>
          </div>

          {/* Professional Blue Template Preview */}
          <div onClick={() => setSelectedTemplate('professional')} style={{
            background: selectedTemplate === 'professional' ? '#2563eb' : '#334155',
            borderRadius: 8, padding: '0.75rem', cursor: 'pointer', width: '140px',
            border: selectedTemplate === 'professional' ? '3px solid #60a5fa' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div style={{ background: '#fff', borderRadius: 4, height: '100px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ background: '#0066cc', color: '#fff', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.3)', borderRadius: 2 }}></div>
                <div>
                  <div style={{ fontSize: '7px', fontWeight: 700 }}>JOHN DOE</div>
                  <div style={{ fontSize: '4px', opacity: 0.9 }}>Software Engineer</div>
                </div>
              </div>
              <div style={{ display: 'flex', height: '62px' }}>
                <div style={{ width: '40%', background: '#f0f7ff', padding: 4 }}>
                  <div style={{ fontSize: '4px', color: '#0066cc', fontWeight: 600 }}>SKILLS</div>
                  <div style={{ fontSize: '3px', color: '#444' }}>React • Node • JS</div>
                </div>
                <div style={{ flex: 1, padding: 4 }}>
                  <div style={{ fontSize: '4px', color: '#0066cc', fontWeight: 600 }}>EXPERIENCE</div>
                  <div style={{ fontSize: '3px', color: '#444' }}>Company Name</div>
                </div>
              </div>
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Professional</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <span style={{ background: '#10b981', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4 }}>Photo</span>
              <span style={{ background: '#0066cc', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4 }}>2-Col</span>
            </div>
          </div>

          {/* Modern Minimal Template Preview */}
          <div onClick={() => setSelectedTemplate('modern')} style={{
            background: selectedTemplate === 'modern' ? '#2563eb' : '#334155',
            borderRadius: 8, padding: '0.75rem', cursor: 'pointer', width: '140px',
            border: selectedTemplate === 'modern' ? '3px solid #60a5fa' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div style={{ background: '#fff', borderRadius: 4, height: '100px', padding: '8px', marginBottom: '0.5rem' }}>
              <div style={{ borderBottom: '1px solid #2563eb', paddingBottom: 6, marginBottom: 6 }}>
                <div style={{ fontSize: '9px', fontWeight: 300, letterSpacing: '1px' }}>John Doe</div>
                <div style={{ fontSize: '4px', color: '#666', display: 'flex', gap: 6 }}>
                  <span>email@mail.com</span><span style={{ color: '#2563eb' }}>linkedin.com</span>
                </div>
              </div>
              <div style={{ fontSize: '5px', color: '#2563eb', letterSpacing: '1px', fontWeight: 400, marginBottom: 2 }}>PROFILE</div>
              <div style={{ fontSize: '4px', color: '#444', marginBottom: 4, lineHeight: 1.4 }}>Clean minimal design with elegant typography...</div>
              <div style={{ fontSize: '5px', color: '#2563eb', letterSpacing: '1px', fontWeight: 400, marginBottom: 2 }}>EDUCATION</div>
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Modern</div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center' }}>Minimal & Elegant</div>
          </div>

          {/* Executive Template Preview */}
          <div onClick={() => setSelectedTemplate('executive')} style={{
            background: selectedTemplate === 'executive' ? '#2563eb' : '#334155',
            borderRadius: 8, padding: '0.75rem', cursor: 'pointer', width: '140px',
            border: selectedTemplate === 'executive' ? '3px solid #60a5fa' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div style={{ background: '#fff', borderRadius: 4, height: '100px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ background: '#f8f9fa', borderBottom: '3px solid #1e3a5f', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '7px', fontWeight: 700, color: '#1e3a5f' }}>JOHN DOE</div>
                  <div style={{ fontSize: '4px', color: '#1e3a5f', fontStyle: 'italic' }}>Executive Director</div>
                </div>
                <div style={{ width: '18px', height: '18px', background: '#1e3a5f', borderRadius: '50%' }}></div>
              </div>
              <div style={{ padding: '4px 8px' }}>
                <div style={{ background: '#f8f9fa', borderLeft: '2px solid #1e3a5f', padding: '3px 6px', marginBottom: 4 }}>
                  <div style={{ fontSize: '4px', color: '#444', fontStyle: 'italic' }}>Executive summary...</div>
                </div>
                <div style={{ fontSize: '5px', color: '#1e3a5f', fontWeight: 600 }}>EXPERIENCE</div>
              </div>
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Executive</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <span style={{ background: '#10b981', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4 }}>Photo</span>
              <span style={{ background: '#1e3a5f', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4 }}>Formal</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      {/* Left: Resume Form */}
      <div style={{ width: '420px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 16px #e0e7ff', padding: '2rem', minHeight: '80vh', overflowY: 'auto', maxHeight: '85vh' }}>
        {/* Save Controls */}
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" placeholder="Resume name..." value={resumeName} onChange={e => setResumeName(e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: 4, border: '1px solid #ccc' }} />
            <button onClick={handleSaveResume} disabled={saving} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? '...' : currentResumeId ? '💾 Update' : '💾 Save'}
            </button>
          </div>
          {currentResumeId && <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4 }}>✓ Editing: {resumeName}</div>}
        </div>

        {/* Photo Upload for templates with photo */}
        {currentTemplateData?.hasPhoto && (
          <fieldset style={{ border: 'none', marginBottom: '1rem' }}>
            <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1rem' }}>Profile Photo</legend>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '0.85rem' }} />
            {photoUrl && <img src={photoUrl} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
          </fieldset>
        )}

        <h2 style={{ fontSize: '1.5rem', color: '#111', marginBottom: '1rem', fontWeight: 700 }}>Resume Details</h2>
        <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Personal Info</legend>
          <input name="name" placeholder="Full Name" value={resume.personalInfo.name} onChange={handlePersonalInfoChange} style={{ width: '100%', margin: '8px 0', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          <input name="email" placeholder="Email" value={resume.personalInfo.email} onChange={handlePersonalInfoChange} style={{ width: '100%', margin: '8px 0', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          <input name="phone" placeholder="Phone" value={resume.personalInfo.phone} onChange={handlePersonalInfoChange} style={{ width: '100%', margin: '8px 0', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
          {/* Custom Links UI */}
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Links</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {resume.personalInfo.links.map((l, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 500 }}>{l.label}:</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0645AD', textDecoration: 'underline', fontSize: '0.98em' }}>{l.url}</a>
                  <button type="button" onClick={() => handleEditLink(idx)} style={{ marginLeft: 4, background: '#e0e7ff', color: '#3b5bdb', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteLink(idx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Delete</button>
                </li>
              ))}
            </ul>
            <form onSubmit={editingLinkIdx === null ? handleAddLink : handleSaveLink} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input type="text" placeholder="Label (e.g. LinkedIn)" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} style={{ flex: 1, padding: '6px' }} />
              <input type="text" placeholder="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{ flex: 2, padding: '6px' }} />
              <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{editingLinkIdx === null ? 'Add' : 'Save'}</button>
              {editingLinkIdx !== null && <button type="button" onClick={() => { setEditingLinkIdx(null); setLinkLabel(""); setLinkUrl(""); }} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Cancel</button>}
            </form>
          </div>
        </fieldset>
        <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Summary</legend>
          <textarea placeholder="Short objective or bio" value={resume.summary} onChange={handleSummaryChange} style={{ width: '100%', minHeight: '60px', margin: '8px 0', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
        </fieldset>
        <Education education={resume.education} setEducation={edus => setResume({ ...resume, education: edus })} />
        <Skills skillsGroups={skillsGroups} setSkillsGroups={setSkillsGroups} />
        <SectionList sectionKey="experience" title="Experience" items={resume.experience} onAdd={item => addSectionItem("experience", item)} onEdit={(idx, item) => editSectionItem("experience", idx, item)} onDelete={idx => deleteSectionItem("experience", idx)} addLabel="Add Experience" emptyLabel="No experience added." renderItem={(item = {}, onChange, points, setPoints) => onChange ? (<><input name="company" placeholder="Company" value={item.company || ""} onChange={onChange} style={{ padding: '6px' }} /><input name="role" placeholder="Role" value={item.role || ""} onChange={onChange} style={{ padding: '6px' }} /><input name="duration" placeholder="Duration" value={item.duration || ""} onChange={onChange} style={{ padding: '6px' }} /><PointsInput points={points} setPoints={setPoints} /></>) : (<><span style={label}>{item.role}</span> at <span style={label}>{item.company}</span><span style={dateStyle}>{item.duration}</span><ul style={bulletList}>{(item.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></>)} />
        <Projects projects={resume.projects} setProjects={projs => setResume({ ...resume, projects: projs })} />
        <SectionList sectionKey="certifications" title="Certifications" items={resume.certifications} onAdd={item => addSectionItem("certifications", item.name ? item : { name: item })} onEdit={(idx, item) => editSectionItem("certifications", idx, item.name ? item : { name: item })} onDelete={idx => deleteSectionItem("certifications", idx)} addLabel="Add Certification" emptyLabel="No certifications added." renderItem={(item = {}, onChange) => onChange ? (<input name="name" placeholder="Certification" value={item.name || ""} onChange={onChange} style={{ padding: '6px' }} />) : (<span style={label}>{item.name}</span>)} />
        <SectionList sectionKey="achievements" title="Achievements" items={resume.achievements} onAdd={item => addSectionItem("achievements", item)} onEdit={(idx, item) => editSectionItem("achievements", idx, item)} onDelete={idx => deleteSectionItem("achievements", idx)} addLabel="Add Achievement" emptyLabel="No achievements added." renderItem={(item = {}, onChange, points, setPoints) => onChange ? (<PointsInput points={points} setPoints={setPoints} />) : (<ul style={bulletList}>{(item.point || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul>)} />
        <SectionList sectionKey="hobbies" title="Hobbies" items={resume.hobbies} onAdd={item => addSectionItem("hobbies", item)} onEdit={(idx, item) => editSectionItem("hobbies", idx, item)} onDelete={idx => deleteSectionItem("hobbies", idx)} addLabel="Add Hobby" emptyLabel="No hobbies added." renderItem={(item = {}, onChange, points, setPoints) => onChange ? (<PointsInput points={points} setPoints={setPoints} />) : (<ul style={bulletList}>{(item.point || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul>)} />
        <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
          <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Custom Sections</legend>
          <form onSubmit={handleAddCustomSection} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input type="text" placeholder="Section Title" value={customSectionTitle} onChange={e => setCustomSectionTitle(e.target.value)} style={{ flex: 1, padding: '6px' }} />
            <input type="text" placeholder="Item (optional)" value={customSectionItem} onChange={e => setCustomSectionItem(e.target.value)} style={{ flex: 1, padding: '6px' }} />
            <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
          </form>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {resume.customSections.length === 0 && <li style={{ color: '#888' }}>No custom sections added.</li>}
            {resume.customSections.map((section, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem', background: '#f3f4fa', padding: '0.5rem', borderRadius: '6px' }}>
                <span style={label}>{section.title}</span>
                {section.items && section.items.length > 0 && (
                  <ul style={bulletList}>
                    {section.items.map((item, i) => <li key={i} style={bullet}>{item}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
      {/* Right: ATS Resume Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f7f7fa', borderRadius: '12px', boxShadow: '0 2px 16px #e0e7ff', padding: '1rem', minHeight: '80vh' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', padding: '0 0.5rem', flexShrink: 0 }}>
          <button onClick={handleDownloadPDF} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>📥 Download PDF</button>
          
          {/* Scroll Controls */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#e2e8f0', borderRadius: 8, padding: '4px' }}>
            <button onClick={() => previewScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 4 }} title="Top">⬆️</button>
            <button onClick={() => previewScrollRef.current?.scrollBy({ top: -200, behavior: 'smooth' })} style={{ background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 4 }} title="Up">🔼</button>
            <button onClick={() => previewScrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })} style={{ background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 4 }} title="Down">🔽</button>
            <button onClick={() => previewScrollRef.current?.scrollTo({ top: previewScrollRef.current.scrollHeight, behavior: 'smooth' })} style={{ background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 4 }} title="Bottom">⬇️</button>
            </div>
          
          {/* Zoom Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#e2e8f0', borderRadius: 8, padding: '4px 8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>🔍</span>
            <input 
              type="range" 
              min="30" 
              max="150" 
              value={previewZoom} 
              onChange={(e) => setPreviewZoom(Number(e.target.value))}
              style={{ width: '80px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#475569', minWidth: '35px' }}>{previewZoom}%</span>
            <button onClick={() => setPreviewZoom(100)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', cursor: 'pointer' }}>Reset</button>
          </div>
                </div>
        
        {/* Scrollable Preview Container - Use mouse wheel or scroll bars to view full resume */}
        <div ref={previewScrollRef} style={{ 
          flex: 1, 
          overflowY: 'scroll', 
          overflowX: 'auto', 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          paddingBottom: '2rem',
          maxHeight: 'calc(85vh - 60px)'
        }}>
          {/* Template-based Preview */}
          <div ref={previewRef} id="resume-preview" style={{ 
            width: '210mm', 
            minWidth: '210mm',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
            background: '#fff', 
            flexShrink: 0,
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: 'top center',
            marginBottom: `${(previewZoom < 100) ? (100 - previewZoom) * 10 : 0}px`
          }}>
          
          {/* ============ CLASSIC TEMPLATE ============ */}
          {selectedTemplate === 'classic' && (
            <div style={{ fontFamily: 'Georgia, serif' }}>
              {/* Header */}
              <div style={{ padding: '2rem 2.5rem 1rem', textAlign: 'center', borderBottom: '2px solid #111' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: '#111' }}>{resume.personalInfo.name || 'Your Name'}</h1>
                <div style={{ fontSize: '0.95rem', color: '#333', marginTop: '0.5rem' }}>
                  {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                  {resume.personalInfo.email && <span> | {resume.personalInfo.email}</span>}
                  {resume.personalInfo.links.map((l, idx) => (
                    <span key={idx}> | <a href={l.url} target="_blank" rel="noopener noreferrer" style={contactLink}>{l.label}</a></span>
                  ))}
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '1rem 2.5rem 2rem' }}>
                {resume.summary && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>PROFILE</div><div style={{ color: '#222', fontSize: '1rem', lineHeight: 1.5 }}>{resume.summary}</div></div>}
                {resume.education.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>EDUCATION</div>{resume.education.map((ed, idx) => (<div key={idx} style={{ marginBottom: '0.5em' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>{ed.institution}{ed.location && `, ${ed.location}`}</span><span style={{ color: '#444' }}>{ed.duration}</span></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{ed.degree}{ed.branch && ` in ${ed.branch}`}</span>{ed.cgpa && <span style={{ color: '#444' }}>CGPA: {ed.cgpa}</span>}</div></div>))}</div>}
                {skillsGroups.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>SKILLS</div><div>{skillsGroups.map((g, i) => <div key={i}><strong>{g.name}:</strong> {g.skills.join(', ')}</div>)}</div></div>}
                {resume.experience.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>EXPERIENCE</div>{resume.experience.map((exp, idx) => (<div key={idx} style={{ marginBottom: '0.5em' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>{exp.role}</span><span style={{ color: '#444' }}>{exp.duration}</span></div><div style={{ fontWeight: 500 }}>{exp.company}</div><ul style={bulletList}>{(exp.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {normalizedProjects.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>PROJECTS</div>{normalizedProjects.map((proj, idx) => (<div key={idx} style={{ marginBottom: '0.5em' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 600 }}>{proj.title}</span>{proj.techStack?.length > 0 && <span style={{ fontStyle: 'italic', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}{proj.links?.map((l, i) => l?.url && <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0645AD', marginLeft: 8 }}>{l.label}</a>)}</div><span style={{ color: '#444' }}>{proj.monthYear}</span></div><ul style={bulletList}>{proj.description?.map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {resume.certifications.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>CERTIFICATIONS</div><ul style={bulletList}>{resume.certifications.flatMap((c, i) => c.name.split(',').map((item, j) => <li key={`${i}-${j}`} style={bullet}>{item.trim()}</li>))}</ul></div>}
                {resume.achievements.length > 0 && <div style={{ marginBottom: '1rem' }}><div style={sectionHeader}>ACHIEVEMENTS</div><ul style={bulletList}>{resume.achievements.map((a, i) => (a.point || []).map((d, j) => d && <li key={`${i}-${j}`} style={bullet}>{d}</li>))}</ul></div>}
                </div>
            </div>
          )}

          {/* ============ PROFESSIONAL BLUE TEMPLATE ============ */}
          {selectedTemplate === 'professional' && (
            <div style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Header with Photo */}
              <div style={{ background: '#0066cc', color: '#fff', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '4px', objectFit: 'cover', border: '3px solid #fff' }} />
                ) : (
                  <div style={{ width: '90px', height: '90px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{resume.personalInfo.name || 'YOUR NAME'}</h1>
                  <div style={{ fontSize: '1.1rem', marginTop: '0.3rem', fontWeight: 500 }}>{resume.experience[0]?.role || 'Professional Title'}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.95 }}>
                    {resume.personalInfo.phone && <span>📞 {resume.personalInfo.phone}</span>}
                    {resume.personalInfo.email && <span style={{ marginLeft: '1rem' }}>✉️ {resume.personalInfo.email}</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', opacity: 0.9 }}>
                    {resume.personalInfo.links.map((l, idx) => (
                      <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', marginRight: '1rem' }}>🔗 {l.label}</a>
                    ))}
                  </div>
                </div>
              </div>
              {/* Two Column Layout */}
              <div style={{ display: 'flex' }}>
                {/* Left Sidebar */}
                <div style={{ width: '35%', background: '#f0f7ff', padding: '1.5rem', borderRight: '1px solid #cce0ff' }}>
                  {resume.summary && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>PROFILE</div>
                      <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.5 }}>{resume.summary}</div>
                    </div>
                  )}
                  {skillsGroups.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>SKILLS</div>
                      <div style={{ fontSize: '0.9rem' }}>{skillsGroups.map((g, i) => <div key={i} style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#0066cc' }}>{g.name}</strong><br/>{g.skills.join(' • ')}</div>)}</div>
                    </div>
                  )}
                  {resume.education.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>EDUCATION</div>
                      {resume.education.map((ed, idx) => (
                        <div key={idx} style={{ marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                          <div style={{ fontWeight: 600, color: '#0066cc' }}>{ed.institution}</div>
                          <div>{ed.degree}{ed.branch && ` in ${ed.branch}`}</div>
                          <div style={{ color: '#666', fontSize: '0.85rem' }}>{ed.duration}{ed.cgpa && ` | CGPA: ${ed.cgpa}`}</div>
              </div>
            ))}
                    </div>
                  )}
                  {resume.certifications.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>CERTIFICATIONS</div>
                      <ul style={{ ...bulletList, fontSize: '0.9rem', marginTop: '0.3rem' }}>{resume.certifications.flatMap((c, i) => c.name.split(',').map((item, j) => <li key={`${i}-${j}`} style={bullet}>{item.trim()}</li>))}</ul>
                  </div>
                  )}
                </div>
                {/* Right Content */}
                <div style={{ flex: 1, padding: '1.5rem' }}>
                  {resume.experience.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>EXPERIENCE</div>
                      {resume.experience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#0066cc' }}>{exp.role}</span><span style={{ color: '#666', fontSize: '0.9rem' }}>{exp.duration}</span></div>
                          <div style={{ fontWeight: 500, color: '#333' }}>{exp.company}</div>
                          <ul style={{ ...bulletList, marginTop: '0.3rem' }}>{(exp.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul>
              </div>
            ))}
                    </div>
                  )}
          {normalizedProjects.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>PROJECTS</div>
              {normalizedProjects.map((proj, idx) => (
                        <div key={idx} style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div><span style={{ fontWeight: 600, color: '#0066cc' }}>{proj.title}</span>{proj.techStack?.length > 0 && <span style={{ fontStyle: 'italic', color: '#666', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}{proj.links?.map((l, i) => l?.url && <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', marginLeft: 8 }}>{l.label}</a>)}</div>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>{proj.monthYear}</span>
                          </div>
                          <ul style={{ ...bulletList, marginTop: '0.3rem' }}>{proj.description?.map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.achievements.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0066cc', borderBottom: '2px solid #0066cc', paddingBottom: '0.4rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>ACHIEVEMENTS</div>
                      <ul style={{ ...bulletList, marginTop: '0.3rem' }}>{resume.achievements.map((a, i) => (a.point || []).map((d, j) => d && <li key={`${i}-${j}`} style={bullet}>{d}</li>))}</ul>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ MODERN MINIMAL TEMPLATE ============ */}
          {selectedTemplate === 'modern' && (
            <div style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              {/* Header */}
              <div style={{ padding: '2.5rem 2.5rem 1.5rem', borderBottom: '1px solid #2563eb' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 300, margin: 0, color: '#111', letterSpacing: '1px' }}>{resume.personalInfo.name || 'Your Name'}</h1>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.7rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                  {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                  {resume.personalInfo.links.map((l, idx) => (
                    <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{l.label}</a>
                  ))}
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '1.5rem 2.5rem 2rem' }}>
                {resume.summary && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>PROFILE</div><div style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>{resume.summary}</div></div>}
                {resume.education.length > 0 && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>EDUCATION</div>{resume.education.map((ed, idx) => (<div key={idx} style={{ marginBottom: '0.7em' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 500 }}>{ed.institution}{ed.location && `, ${ed.location}`}</span><span style={{ color: '#888', fontSize: '0.9rem' }}>{ed.duration}</span></div><div style={{ color: '#666' }}>{ed.degree}{ed.branch && ` in ${ed.branch}`}{ed.cgpa && ` — CGPA: ${ed.cgpa}`}</div></div>))}</div>}
                {skillsGroups.length > 0 && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>SKILLS</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>{skillsGroups.map((g, i) => <div key={i}><span style={{ color: '#2563eb', fontWeight: 500 }}>{g.name}:</span> <span style={{ color: '#444' }}>{g.skills.join(', ')}</span></div>)}</div></div>}
                {resume.experience.length > 0 && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>EXPERIENCE</div>{resume.experience.map((exp, idx) => (<div key={idx} style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 500 }}>{exp.role}</span><span style={{ color: '#888', fontSize: '0.9rem' }}>{exp.duration}</span></div><div style={{ color: '#666', marginBottom: '0.3rem' }}>{exp.company}</div><ul style={{ ...bulletList, color: '#444' }}>{(exp.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {normalizedProjects.length > 0 && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>PROJECTS</div>{normalizedProjects.map((proj, idx) => (<div key={idx} style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 500 }}>{proj.title}</span>{proj.techStack?.length > 0 && <span style={{ color: '#888', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}{proj.links?.map((l, i) => l?.url && <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', marginLeft: 8 }}>{l.label}</a>)}</div><span style={{ color: '#888', fontSize: '0.9rem' }}>{proj.monthYear}</span></div><ul style={{ ...bulletList, color: '#444' }}>{proj.description?.map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {resume.certifications.length > 0 && <div style={{ marginBottom: '1.5rem' }}><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>CERTIFICATIONS</div><ul style={{ ...bulletList, color: '#444' }}>{resume.certifications.flatMap((c, i) => c.name.split(',').map((item, j) => <li key={`${i}-${j}`} style={bullet}>{item.trim()}</li>))}</ul></div>}
                {resume.achievements.length > 0 && <div><div style={{ ...sectionHeader, color: '#2563eb', borderColor: '#2563eb', fontWeight: 400, letterSpacing: '2px' }}>ACHIEVEMENTS</div><ul style={{ ...bulletList, color: '#444' }}>{resume.achievements.map((a, i) => (a.point || []).map((d, j) => d && <li key={`${i}-${j}`} style={bullet}>{d}</li>))}</ul></div>}
              </div>
            </div>
          )}

          {/* ============ EXECUTIVE TEMPLATE ============ */}
          {selectedTemplate === 'executive' && (
            <div style={{ fontFamily: "'Times New Roman', serif" }}>
              {/* Header */}
              <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '4px solid #1e3a5f' }}>
                <div style={{ flex: 1, padding: '1.5rem 2rem' }}>
                  <h1 style={{ fontSize: '1.7rem', color: '#1e3a5f', fontWeight: 700, margin: 0 }}>{resume.personalInfo.name || 'YOUR NAME'}</h1>
                  <div style={{ color: '#1e3a5f', fontSize: '1.1rem', marginTop: '0.3rem', fontStyle: 'italic' }}>{resume.experience[0]?.role || 'Professional Title'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    {resume.personalInfo.phone && <span>📞 {resume.personalInfo.phone}</span>}
                    {resume.personalInfo.email && <span style={{ marginLeft: '1rem' }}>✉️ {resume.personalInfo.email}</span>}
                  </div>
                </div>
                {photoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 2rem' }}>
                    <img src={photoUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1e3a5f' }} />
                  </div>
                )}
              </div>
              {/* Content */}
              <div style={{ padding: '1.5rem 2rem' }}>
                {resume.summary && <div style={{ marginBottom: '1.2rem', background: '#f8f9fa', padding: '1rem', borderLeft: '4px solid #1e3a5f' }}><div style={{ color: '#333', fontSize: '1rem', lineHeight: 1.6, fontStyle: 'italic' }}>{resume.summary}</div></div>}
                {resume.education.length > 0 && <div style={{ marginBottom: '1.2rem' }}><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>EDUCATION</div>{resume.education.map((ed, idx) => (<div key={idx} style={{ marginBottom: '0.7em' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{ed.institution}{ed.location && `, ${ed.location}`}</span><span style={{ color: '#666' }}>{ed.duration}</span></div><div style={{ color: '#444' }}>{ed.degree}{ed.branch && ` in ${ed.branch}`}{ed.cgpa && ` | CGPA: ${ed.cgpa}`}</div></div>))}</div>}
                {skillsGroups.length > 0 && <div style={{ marginBottom: '1.2rem' }}><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>SKILLS</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{skillsGroups.map((g, i) => <div key={i} style={{ background: '#f0f4f8', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem' }}><strong style={{ color: '#1e3a5f' }}>{g.name}:</strong> {g.skills.join(', ')}</div>)}</div></div>}
                {resume.experience.length > 0 && <div style={{ marginBottom: '1.2rem' }}><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>EXPERIENCE</div>{resume.experience.map((exp, idx) => (<div key={idx} style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{exp.role}</span><span style={{ color: '#666' }}>{exp.duration}</span></div><div style={{ fontWeight: 500, color: '#444', fontStyle: 'italic' }}>{exp.company}</div><ul style={bulletList}>{(exp.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {normalizedProjects.length > 0 && <div style={{ marginBottom: '1.2rem' }}><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>PROJECTS</div>{normalizedProjects.map((proj, idx) => (<div key={idx} style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{proj.title}</span>{proj.techStack?.length > 0 && <span style={{ fontStyle: 'italic', color: '#666', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}{proj.links?.map((l, i) => l?.url && <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f', marginLeft: 8 }}>{l.label}</a>)}</div><span style={{ color: '#666' }}>{proj.monthYear}</span></div><ul style={bulletList}>{proj.description?.map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}</ul></div>))}</div>}
                {resume.certifications.length > 0 && <div style={{ marginBottom: '1.2rem' }}><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>CERTIFICATIONS</div><ul style={bulletList}>{resume.certifications.flatMap((c, i) => c.name.split(',').map((item, j) => <li key={`${i}-${j}`} style={bullet}>{item.trim()}</li>))}</ul></div>}
                {resume.achievements.length > 0 && <div><div style={{ ...sectionHeader, color: '#1e3a5f', borderColor: '#1e3a5f' }}>ACHIEVEMENTS</div><ul style={bulletList}>{resume.achievements.map((a, i) => (a.point || []).map((d, j) => d && <li key={`${i}-${j}`} style={bullet}>{d}</li>))}</ul></div>}
              </div>
            </div>
          )}

            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
