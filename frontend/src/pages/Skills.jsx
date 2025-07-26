import React, { useState } from "react";

export default function Skills({ skillsGroups, setSkillsGroups }) {
  const [groupName, setGroupName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [editingGroupIdx, setEditingGroupIdx] = useState(null);
  const [editingSkillIdx, setEditingSkillIdx] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState("");

  // Add group
  const handleAddGroup = (e) => {
    e.preventDefault();
    if (groupName.trim() && !skillsGroups.some(g => g.name === groupName.trim())) {
      setSkillsGroups([...skillsGroups, { name: groupName.trim(), skills: [] }]);
      setGroupName("");
    }
  };
  // Delete group
  const handleDeleteGroup = (idx) => {
    setSkillsGroups(skillsGroups.filter((_, i) => i !== idx));
  };
  // Add skill to group
  const handleAddSkill = (idx, e) => {
    e.preventDefault();
    if (skillInput.trim()) {
      setSkillsGroups(skillsGroups.map((g, i) => i === idx ? { ...g, skills: [...g.skills, skillInput.trim()] } : g));
      setSkillInput("");
    }
  };
  // Delete skill from group
  const handleDeleteSkill = (gIdx, sIdx) => {
    setSkillsGroups(skillsGroups.map((g, i) => i === gIdx ? { ...g, skills: g.skills.filter((_, j) => j !== sIdx) } : g));
  };
  // Edit skill in group
  const handleEditSkill = (gIdx, sIdx) => {
    setEditingGroupIdx(gIdx);
    setEditingSkillIdx(sIdx);
    setEditingSkillValue(skillsGroups[gIdx].skills[sIdx]);
  };
  const handleSaveSkill = (gIdx, sIdx, e) => {
    e.preventDefault();
    setSkillsGroups(skillsGroups.map((g, i) => i === gIdx ? { ...g, skills: g.skills.map((s, j) => j === sIdx ? editingSkillValue : s) } : g));
    setEditingGroupIdx(null);
    setEditingSkillIdx(null);
    setEditingSkillValue("");
  };
  return (
    <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
      <legend style={{ fontWeight: 'bold', color: '#111', fontSize: '1.15rem', letterSpacing: '0.5px' }}>Skills</legend>
      <form onSubmit={handleAddGroup} style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input type="text" placeholder="Add Group (e.g. Languages)" value={groupName} onChange={e => setGroupName(e.target.value)} style={{ flex: 1, padding: '6px' }} />
        <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add Group</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {skillsGroups.map((group, gIdx) => (
          <li key={gIdx} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              {group.name}
              <button type="button" onClick={() => handleDeleteGroup(gIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
            </div>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
              {group.skills.map((skill, sIdx) => (
                <li key={sIdx} style={{ background: '#e0e7ff', color: '#111', padding: '4px 10px', borderRadius: '12px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {editingGroupIdx === gIdx && editingSkillIdx === sIdx ? (
                    <form onSubmit={e => handleSaveSkill(gIdx, sIdx, e)} style={{ display: 'flex', gap: 2 }}>
                      <input value={editingSkillValue} onChange={e => setEditingSkillValue(e.target.value)} style={{ padding: '2px 6px', fontSize: '0.98rem' }} />
                      <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Save</button>
                      <button type="button" onClick={() => { setEditingGroupIdx(null); setEditingSkillIdx(null); setEditingSkillValue(""); }} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      {skill}
                      <button type="button" onClick={() => handleEditSkill(gIdx, sIdx)} style={{ background: '#e0e7ff', color: '#3b5bdb', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Edit</button>
                      <button type="button" onClick={() => handleDeleteSkill(gIdx, sIdx)} style={{ background: '#ffb4b4', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '0.95em' }}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={e => handleAddSkill(gIdx, e)} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input type="text" placeholder="Add Skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} style={{ flex: 1, padding: '6px' }} />
              <button type="submit" style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add Skill</button>
            </form>
          </li>
        ))}
      </ul>
    </fieldset>
  );
} 