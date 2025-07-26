import React, { useState } from "react";

export default function Education({ education, setEducation }) {
  const initialForm = { institution: '', degree: '', branch: '', location: '', duration: '', cgpa: '', extra: '' };
  const [form, setForm] = useState(initialForm);
  const [editingIdx, setEditingIdx] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdd = (e) => {
    e.preventDefault();
    if (form.institution.trim() && form.degree.trim()) {
      setEducation([...education, form]);
      setForm(initialForm);
    }
  };
  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setForm(education[idx]);
  };
  const handleSave = (e) => {
    e.preventDefault();
    setEducation(education.map((ed, i) => i === editingIdx ? form : ed));
    setEditingIdx(null);
    setForm(initialForm);
  };
  const handleDelete = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setForm(initialForm);
  };
  const handleCancel = () => {
    setEditingIdx(null);
    setForm(initialForm);
  };
  return (
    <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
      <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Education</legend>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {education.map((ed, idx) => (
          <li key={idx} style={{ marginBottom: 8, background: '#f3f4fa', padding: '0.5rem', borderRadius: '6px' }}>
            {editingIdx === idx ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input name="institution" placeholder="Institution" value={form.institution} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="degree" placeholder="Degree" value={form.degree} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="branch" placeholder="Branch (e.g. Data Science)" value={form.branch} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="duration" placeholder="Duration (e.g. 2022-2026)" value={form.duration} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="cgpa" placeholder="CGPA (e.g. 9.45/10)" value={form.cgpa} onChange={handleChange} style={{ padding: '6px' }} />
                <input name="extra" placeholder="Extra (optional, e.g. Double Degree)" value={form.extra} onChange={handleChange} style={{ padding: '6px' }} />
                <div>
                  <button type="submit" style={{ marginRight: 8, background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={handleCancel} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{ed.institution}</span>{ed.location && <span>, {ed.location}</span>}
                  </div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{ed.duration}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>{ed.degree}{ed.branch && ` in ${ed.branch}`}</div>
                  <div style={{ color: '#444', fontSize: '0.98rem', fontWeight: 400 }}>{ed.cgpa && `CGPA: ${ed.cgpa}`}</div>
                </div>
                {ed.extra && <div style={{ fontSize: '0.98rem', color: '#222', marginLeft: 2 }}>{ed.extra}</div>}
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
          <input name="institution" placeholder="Institution" value={form.institution} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="degree" placeholder="Degree" value={form.degree} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="branch" placeholder="Branch (e.g. Data Science)" value={form.branch} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="duration" placeholder="Duration (e.g. 2022-2026)" value={form.duration} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="cgpa" placeholder="CGPA (e.g. 9.45/10)" value={form.cgpa} onChange={handleChange} style={{ padding: '6px' }} />
          <input name="extra" placeholder="Extra (optional, e.g. Double Degree)" value={form.extra} onChange={handleChange} style={{ padding: '6px' }} />
          <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', alignSelf: 'flex-start' }}>Add Education</button>
        </form>
      )}
    </fieldset>
  );
} 