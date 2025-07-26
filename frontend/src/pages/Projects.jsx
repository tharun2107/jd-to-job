import React, { useState } from "react";

export default function Projects({ projects, setProjects }) {
  const initialForm = {
    title: '',
    techStack: [],
    techInput: '',
    links: [], // { label, url }
    linkLabel: '',
    linkUrl: '',
    monthYear: '',
    description: [''],
    descInput: '',
  };
  const [form, setForm] = useState(initialForm);
  const [editingIdx, setEditingIdx] = useState(null);

  // Tech stack
  const handleAddTech = () => {
    if (form.techInput.trim()) {
      setForm({ ...form, techStack: [...form.techStack, form.techInput.trim()], techInput: '' });
    }
  };
  const handleRemoveTech = (idx) => {
    setForm({ ...form, techStack: form.techStack.filter((_, i) => i !== idx) });
  };
  // Links
  const handleAddLink = () => {
    if (form.linkLabel.trim() && form.linkUrl.trim()) {
      setForm({ ...form, links: [...form.links, { label: form.linkLabel.trim(), url: form.linkUrl.trim() }], linkLabel: '', linkUrl: '' });
    }
  };
  const handleRemoveLink = (idx) => {
    setForm({ ...form, links: form.links.filter((_, i) => i !== idx) });
  };
  // Description
  const handleAddDesc = () => {
    if (form.descInput.trim()) {
      setForm({ ...form, description: [...form.description, form.descInput.trim()], descInput: '' });
    }
  };
  const handleRemoveDesc = (idx) => {
    setForm({ ...form, description: form.description.filter((_, i) => i !== idx) });
  };
  // Main form handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdd = (e) => {
    e.preventDefault();
    // Add any pending techInput/linkLabel+linkUrl/descInput to arrays
    let techStack = (form.techStack || []).filter(t => t && t.trim() !== '');
    if (form.techInput && form.techInput.trim()) techStack = [...techStack, form.techInput.trim()];
    let links = (form.links || []).filter(l => l && l.label && l.url);
    if (form.linkLabel && form.linkLabel.trim() && form.linkUrl && form.linkUrl.trim()) links = [...links, { label: form.linkLabel.trim(), url: form.linkUrl.trim() }];
    let description = (form.description || []).filter(d => d && d.trim() !== '');
    if (form.descInput && form.descInput.trim()) description = [...description, form.descInput.trim()];
    if (form.title.trim()) {
      setProjects([...projects, {
        title: form.title,
        techStack,
        links,
        monthYear: form.monthYear,
        description,
      }]);
      setForm(initialForm);
    }
  };
  const handleEdit = (idx) => {
    const p = projects[idx];
    console.log('handleEdit - project before normalization:', p);
    const normalized = {
      ...p,
      techStack: Array.isArray(p.techStack) ? p.techStack : (p.techStack ? [p.techStack] : []),
      links: Array.isArray(p.links) ? p.links : (p.links ? [p.links] : []),
      description: Array.isArray(p.description) ? p.description : (p.description ? [p.description] : []),
      techInput: '',
      linkLabel: '',
      linkUrl: '',
      descInput: '',
    };
    console.log('handleEdit - normalized:', normalized);
    setEditingIdx(idx);
    setForm(normalized);
  };
  const handleSave = (e) => {
    e.preventDefault();
    let techStack = (form.techStack || []).filter(t => t && t.trim() !== '');
    if (form.techInput && form.techInput.trim()) techStack = [...techStack, form.techInput.trim()];
    let links = (form.links || []).filter(l => l && l.label && l.url);
    if (form.linkLabel && form.linkLabel.trim() && form.linkUrl && form.linkUrl.trim()) links = [...links, { label: form.linkLabel.trim(), url: form.linkUrl.trim() }];
    let description = (form.description || []).filter(d => d && d.trim() !== '');
    if (form.descInput && form.descInput.trim()) description = [...description, form.descInput.trim()];
    setProjects(projects.map((p, i) => i === editingIdx ? {
      title: form.title,
      techStack,
      links,
      monthYear: form.monthYear,
      description,
    } : p));
    setEditingIdx(null);
    setForm(initialForm);
  };
  const handleDelete = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setForm(initialForm);
  };
  const handleCancel = () => {
    setEditingIdx(null);
    setForm(initialForm);
  };
  return (
    <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
      <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Projects</legend>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {projects.map((proj, idx) => (
          <li key={idx} style={{ marginBottom: 8, background: '#f3f4fa', padding: '0.5rem', borderRadius: '6px' }}>
            {editingIdx === idx ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input name="title" placeholder="Title" value={form.title} onChange={handleChange} style={{ padding: '6px' }} />
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Tech Stack</div>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                  {form.techStack.map((tech, tIdx) => (
                    <li key={tIdx} style={{ background: '#e0e7ff', color: '#111', padding: '4px 10px', borderRadius: '12px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {tech}
                      <button type="button" onClick={() => handleRemoveTech(tIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <input type="text" placeholder="Add Tech" value={form.techInput} onChange={e => setForm({ ...form, techInput: e.target.value })} style={{ flex: 1, padding: '6px' }} />
                  <button type="button" onClick={handleAddTech} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
                </div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Links</div>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                  {form.links.map((l, lIdx) => (
                    <li key={lIdx} style={{ color: '#0645AD', textDecoration: 'underline', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                      <button type="button" onClick={() => handleRemoveLink(lIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <input type="text" placeholder="Label (e.g. GitHub)" value={form.linkLabel} onChange={e => setForm({ ...form, linkLabel: e.target.value })} style={{ flex: 1, padding: '6px' }} />
                  <input type="text" placeholder="URL" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} style={{ flex: 2, padding: '6px' }} />
                  <button type="button" onClick={handleAddLink} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
                </div>
                <input name="monthYear" placeholder="Month-Year (e.g. Sep-2024)" value={form.monthYear} onChange={handleChange} style={{ padding: '6px' }} />
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Description</div>
                <ul style={{ listStyle: 'disc', marginLeft: '1.2em', color: '#222', fontSize: '1.01rem' }}>
                  {form.description.map((desc, dIdx) => (
                    <li key={dIdx} style={{ marginBottom: '0.2em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {desc}
                      <button type="button" onClick={() => handleRemoveDesc(dIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <input type="text" placeholder="Add Description Point" value={form.descInput} onChange={e => setForm({ ...form, descInput: e.target.value })} style={{ flex: 1, padding: '6px' }} />
                  <button type="button" onClick={handleAddDesc} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
                </div>
                <div>
                  <button type="submit" style={{ marginRight: 8, background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={handleCancel} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{proj.title}</span>
                    {proj.techStack.length > 0 && <span style={{ fontStyle: 'italic', fontSize: '0.98rem', marginLeft: 8 }}>{proj.techStack.join(', ')}</span>}
                    {proj.links.length > 0 && <span style={{ marginLeft: 8 }}>{proj.links.map((l, lIdx) => <a key={lIdx} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0645AD', textDecoration: 'underline', marginLeft: lIdx > 0 ? 8 : 0 }}>{l.label}</a>)}</span>}
                  </div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{proj.monthYear}</div>
                </div>
                <ul style={{ listStyle: 'disc', marginLeft: '1.2em', color: '#222', fontSize: '1.01rem' }}>
                  {proj.description.map((desc, dIdx) => desc && <li key={dIdx} style={{ marginBottom: '0.2em' }}>{desc}</li>)}
                </ul>
                <div>
                  <button type="button" onClick={() => handleEdit(idx)} style={{ marginRight: 8, background: '#e0e7ff', color: '#3b5bdb', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDelete(idx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editingIdx === null && (
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} style={{ padding: '6px' }} />
          <div style={{ fontWeight: 500, marginBottom: 2 }}>Tech Stack</div>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {form.techStack.map((tech, tIdx) => (
              <li key={tIdx} style={{ background: '#e0e7ff', color: '#111', padding: '4px 10px', borderRadius: '12px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                {tech}
                <button type="button" onClick={() => handleRemoveTech(tIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <input type="text" placeholder="Add Tech" value={form.techInput} onChange={e => setForm({ ...form, techInput: e.target.value })} style={{ flex: 1, padding: '6px' }} />
            <button type="button" onClick={handleAddTech} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>Links</div>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {form.links.map((l, lIdx) => (
              <li key={lIdx} style={{ color: '#0645AD', textDecoration: 'underline', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                <button type="button" onClick={() => handleRemoveLink(lIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <input type="text" placeholder="Label (e.g. GitHub)" value={form.linkLabel} onChange={e => setForm({ ...form, linkLabel: e.target.value })} style={{ flex: 1, padding: '6px' }} />
            <input type="text" placeholder="URL" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} style={{ flex: 2, padding: '6px' }} />
            <button type="button" onClick={handleAddLink} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
          </div>
          <input name="monthYear" placeholder="Month-Year (e.g. Sep-2024)" value={form.monthYear} onChange={handleChange} style={{ padding: '6px' }} />
          <div style={{ fontWeight: 500, marginBottom: 2 }}>Description</div>
          <ul style={{ listStyle: 'disc', marginLeft: '1.2em', color: '#222', fontSize: '1.01rem' }}>
            {form.description.map((desc, dIdx) => (
              <li key={dIdx} style={{ marginBottom: '0.2em', display: 'flex', alignItems: 'center', gap: 4 }}>
                {desc}
                <button type="button" onClick={() => handleRemoveDesc(dIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <input type="text" placeholder="Add Description Point" value={form.descInput} onChange={e => setForm({ ...form, descInput: e.target.value })} style={{ flex: 1, padding: '6px' }} />
            <button type="button" onClick={handleAddDesc} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add</button>
          </div>
          <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', alignSelf: 'flex-start' }}>Add Project</button>
        </form>
      )}
    </fieldset>
  );
} 