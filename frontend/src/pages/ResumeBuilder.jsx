import React, { useState, useRef } from "react";

import Skills from './Skills';
import Education from './Education';
import Projects from './Projects';

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

  // Header links state for add/edit
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [editingLinkIdx, setEditingLinkIdx] = useState(null);

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
      html2pdf().from(previewRef.current).set({
        margin: 0,
        filename: `${resume.personalInfo.name || "resume"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).save();
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
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)' }}>
      {/* Left: Resume Form */}
      <div style={{ width: '420px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 16px #e0e7ff', padding: '2rem', margin: '2rem 1rem', minHeight: '80vh', overflowY: 'auto', maxHeight: '90vh' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#111', marginBottom: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>Resume Builder</h2>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f7f7fa', borderRadius: '12px', boxShadow: '0 2px 16px #e0e7ff', padding: '2.5rem 2.5rem 2.5rem 2.5rem', margin: '2rem 1rem', minHeight: '80vh', overflowY: 'auto', maxHeight: '90vh', overflowX: 'hidden' }}>
        {/* Download button OUTSIDE previewRef so it is not included in PDF */}
        <button onClick={handleDownloadPDF} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', marginBottom: '1.2em', alignSelf: 'center' }}>Download PDF</button>
        <style>{`
          @media (max-width: 600px) {
            .resume-preview-mobile {
              padding: 1rem !important;
              font-size: 0.98rem !important;
            }
            .resume-header-mobile {
              font-size: 1.1rem !important;
            }
          }
        `}</style>
              <div ref={previewRef} className="resume-preview-mobile" style={{ width: '210mm', maxWidth: '210mm', boxShadow: '0 1px 8px #e0e7ff', margin: '0 auto', position: 'relative', background: '#fff', padding: '2.5rem 2.5rem', boxSizing: 'border-box', overflow: 'visible' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h1 className="resume-header-mobile" style={{ fontSize: '1.5rem', color: '#111', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 0.2em 0', textAlign: 'center' }}>{resume.personalInfo.name || 'Your Name'}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', margin: '0 0 0.1em 0', gap: '0.1em', color: '#222' }}>
              {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
              {resume.personalInfo.email && <span>| {resume.personalInfo.email}</span>}
              {resume.personalInfo.links.map((l, idx) => (
                <span key={idx}>| <a href={l.url} target="_blank" rel="noopener noreferrer" style={contactLink}>{l.label}</a></span>
              ))}
            </div>
          </div>
          {/* PROFILE section header and summary */}
          {resume.summary && <div><div style={sectionHeader}>PROFILE</div>
            <div style={{ margin: '0.7em 0 1.2em 0', color: '#222', fontSize: '1.05rem' }}>{resume.summary}</div>
          </div>}
          {/* Education */}
          {resume.education.length > 0 && <div style={{ pageBreakInside: 'avoid' }}><div style={sectionHeader}>EDUCATION</div>
            {resume.education.map((ed, idx) => (
              <div key={idx} style={{ marginBottom: '0.3em', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div><span style={{ fontWeight: 600 }}>{ed.institution}</span>{ed.location && <span>, {ed.location}</span>}</div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{ed.duration}</div>
                </div>
                <div style={{ height: '0.2em' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ textTransform: 'capitalize' }}>{ed.degree}{ed.branch && ` in ${ed.branch}`}</div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{ed.cgpa && `CGPA: ${ed.cgpa}`}</div>
                </div>
                {ed.extra && <div style={{ fontSize: '0.98rem', color: '#222', marginLeft: 2 }}>{ed.extra}</div>}
              </div>
            ))}
          </div>}
          {/* Skills */}
          {skillsGroups.length > 0 && <div style={{ pageBreakInside: 'avoid' }}><div style={sectionHeader}>SKILLS</div>
            <div style={{ margin: '0.2em 0 0.7em 0', color: '#222', fontSize: '1.01rem' }}>
              {skillsGroups.map((group, idx) => (
                <div key={idx} style={{ marginBottom: 2 }}>
                  <span style={{ fontWeight: 600 }}>{group.name}:</span> {group.skills.join(', ')}
                </div>
              ))}
            </div>
          </div>}
          {/* Experience */}
          {resume.experience.length > 0 && <div style={{ pageBreakInside: 'avoid' }}><div style={sectionHeader}>EXPERIENCE</div>
            {resume.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '0.3em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={label}>{exp.role}</span> <span style={dateStyle}>{exp.duration}</span>
                </div>
                <div style={{ fontWeight: 500 }}>{exp.company}</div>
                <ul style={bulletList}>
                  {(exp.details || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>}
          {/* Projects */}
          {/* {normalizedProjects.length > 0 && <div style={{ pageBreakInside: 'avoid' }}><div style={sectionHeader}>PROJECTS</div>
            {normalizedProjects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: '0.3em', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{proj.title}</span>
                    {proj.techStack && proj.techStack.length > 0 && <span style={{ fontStyle: 'italic', fontSize: '0.98rem', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}
                    {proj.links && proj.links.length > 0 && <span style={{ marginLeft: 8 }}>{proj.links.map((l, lIdx) => l && l.label && l.url && <a key={lIdx} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0645AD', textDecoration: 'underline', marginLeft: lIdx > 0 ? 8 : 0 }}>{l.label}</a>)}</span>}
                  </div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{proj.monthYear}</div>
                </div>
                <ul style={{ listStyle: 'disc', marginLeft: '1.2em', color: '#222', fontSize: '1.01rem' }}>
                  {proj.description && proj.description.map((desc, dIdx) => desc && <li key={dIdx} style={{ marginBottom: '0.2em' }}>{desc}</li>)}
                </ul>
              </div>
            ))}
          </div>} */}
          {normalizedProjects.length > 0 && (
            <div style={{ pageBreakInside: 'avoid', marginBottom: '0.5em' }}>
              <div style={{ ...sectionHeader, marginBottom: '0.1em' }}>PROJECTS</div>
              {normalizedProjects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '0.2em',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{proj.title}</span>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <span style={{ fontStyle: 'italic', fontSize: '0.98rem', marginLeft: 8 }}>
                          {proj.techStack.join(', ')}
                        </span>
                      )}
                      {proj.links && proj.links.length > 0 && (
                        <span style={{ marginLeft: 8 }}>
                          {proj.links.map(
                            (l, lIdx) =>
                              l &&
                              l.label &&
                              l.url && (
                                <a
                                  key={lIdx}
                                  href={l.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#0645AD',
                                    textDecoration: 'underline',
                                    marginLeft: lIdx > 0 ? 8 : 0,
                                  }}
                                >
                                  {l.label}
                                </a>
                              )
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{proj.monthYear}</div>
                  </div>
                  <ul style={{ listStyle: 'disc', marginLeft: '0.7em', color: '#222', fontSize: '1.01rem', marginTop: 0, marginBottom: 0 }}>
                    {proj.description &&
                      proj.description.map(
                        (desc, dIdx) =>
                          desc && (
                            <li key={dIdx} style={{ marginBottom: '0.15em' }}>
                              {desc}
                            </li>
                          )
                      )}
                  </ul>
                </div>
              ))}
            </div>
          )}


          {resume.certifications.length > 0 && (
            <div style={{ pageBreakInside: 'avoid' }}>
              <div style={sectionHeader}>CERTIFICATIONS</div>
              <ul style={bulletList}>
                {resume.certifications.flatMap((cert, idx) =>
                  cert.name.split(',').map((item, i) => (
                    <li key={idx + '-' + i} style={bullet}>
                      {item.trim()}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {resume.achievements.length > 0 && (
            <div style={{ pageBreakInside: 'avoid' }}>
              <div style={sectionHeader}>ACHIEVEMENTS</div>
              <ul style={bulletList}>
                {resume.achievements.map((ach, idx) =>
                  (ach.point || []).map(
                    (d, i) => d && <li key={i} style={bullet}>{d}</li>
                  )
                )}
              </ul>
            </div>
          )}
          {/* Hobbies */}
          {resume.hobbies.length > 0 && <div><div style={sectionHeader}>HOBBIES</div>
            <ul style={bulletList}>
              {resume.hobbies.map((hob, idx) => (hob.point || []).map((d, i) => d && <li key={i} style={bullet}>{d}</li>))}
            </ul>
          </div>}
          {/* Custom Sections */}
          {resume.customSections.length > 0 && resume.customSections.map((section, idx) => (
            <div key={idx}><div style={sectionHeader}>{section.title.toUpperCase()}</div>
              <ul style={bulletList}>
                {section.items && section.items.map((item, i) => <li key={i} style={bullet}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
