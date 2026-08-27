import { useMemo, useRef, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { useAuth } from "./AuthContext";
import { api } from "./api";
import { emptyResume, SKILL_OPTIONS } from "./emptyResume";
import ResumePreview from "./ResumePreview";

function useProgress(resume) {
  return useMemo(() => {
    const required = [resume.personal.name, resume.personal.email, resume.personal.phone, resume.summary];
    const filled = required.filter((v) => v && v.trim()).length;
    const hasEdu = resume.education.some((r) => r.degree.trim());
    const hasExp = resume.experience.some((r) => r.title.trim());
    const hasSkill = resume.skills.length > 0;
    const total = required.length + 3;
    const score = filled + (hasEdu ? 1 : 0) + (hasExp ? 1 : 0) + (hasSkill ? 1 : 0);
    return Math.round((score / total) * 100);
  }, [resume]);
}

export default function ResumeBuilder() {
  const { username, logout } = useAuth();
  const [resume, setResume] = useState(emptyResume());
  const [template, setTemplate] = useState("modern");
  const [title, setTitle] = useState("Untitled Resume");
  const [savedResumes, setSavedResumes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [status, setStatus] = useState("");
  const previewRef = useRef(null);
  const progress = useProgress(resume);

  const loadList = async () => {
    try {
      setSavedResumes(await api.listResumes());
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePersonal = (key) => (e) =>
    setResume((r) => ({ ...r, personal: { ...r.personal, [key]: e.target.value } }));

  const updateField = (key) => (e) => setResume((r) => ({ ...r, [key]: e.target.value }));

  const updateRow = (section, index, key) => (e) =>
    setResume((r) => {
      const rows = [...r[section]];
      rows[index] = { ...rows[index], [key]: e.target.value };
      return { ...r, [section]: rows };
    });

  const addRow = (section, blank) =>
    setResume((r) => ({ ...r, [section]: [...r[section], blank] }));

  const removeRow = (section, index) =>
    setResume((r) => ({ ...r, [section]: r[section].filter((_, i) => i !== index) }));

  const toggleSkill = (skill) =>
    setResume((r) => ({
      ...r,
      skills: r.skills.includes(skill) ? r.skills.filter((s) => s !== skill) : [...r.skills, skill],
    }));

  const allSkills = useMemo(() => {
    const custom = resume.customSkills.split(",").map((s) => s.trim()).filter(Boolean);
    return [...new Set([...resume.skills, ...custom])];
  }, [resume.skills, resume.customSkills]);

  const clearForm = () => {
    if (!confirm("Clear the whole form?")) return;
    setResume(emptyResume());
    setActiveId(null);
    setTitle("Untitled Resume");
  };

  const downloadClientPdf = () => {
    html2pdf()
      .set({ filename: `${title || "resume"}.pdf`, margin: 10 })
      .from(previewRef.current)
      .save();
  };

  const saveResume = async () => {
    setStatus("Saving…");
    const payload = { title, template, data: { ...resume, skills: allSkills } };
    try {
      if (activeId) {
        await api.updateResume(activeId, payload);
      } else {
        const created = await api.createResume(payload);
        setActiveId(created.id);
      }
      await loadList();
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.message);
    }
  };

  const loadResume = (saved) => {
    setActiveId(saved.id);
    setTitle(saved.title);
    setTemplate(saved.template);
    setResume({ ...emptyResume(), ...saved.data, customSkills: "" });
  };

  const deleteResume = async (id) => {
    if (!confirm("Delete this saved resume?")) return;
    await api.deleteResume(id);
    if (id === activeId) setActiveId(null);
    loadList();
  };

  const downloadServerPdf = async () => {
    if (!activeId) {
      setStatus("Save the resume first to export it server-side.");
      return;
    }
    const blob = await api.exportPdf(activeId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "resume"}-server.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <header>
        <div className="header-inner">
          <div>
            <h1>Resume Builder</h1>
            <p className="tagline">Fill the form — your resume updates instantly on the right.</p>
          </div>
          <div className="header-actions">
            <span className="who">Signed in as {username}</span>
            <button className="btn-outline" onClick={logout}>Log out</button>
          </div>
        </div>
        <div className="prog-wrap">
          <span className="prog-label">Form progress: <strong>{progress}%</strong></span>
          <div className="prog-track"><div className="prog-bar" style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <main className="layout">
        <section className="form-panel" aria-label="Resume form">
          <div className="card">
            <h2 className="card-title">My resumes</h2>
            <div className="grid-2">
              <label>Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label>Template
                <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
            </div>
            <div className="row-actions">
              <button className="btn-solid" onClick={saveResume}>💾 Save to account</button>
              <button className="btn-outline" onClick={() => { setActiveId(null); setResume(emptyResume()); setTitle("Untitled Resume"); }}>+ New</button>
            </div>
            {status && <p className="hint">{status}</p>}
            {savedResumes.length > 0 && (
              <ul className="saved-list">
                {savedResumes.map((r) => (
                  <li key={r.id} className={r.id === activeId ? "active" : ""}>
                    <button className="link-btn" onClick={() => loadResume(r)}>{r.title}</button>
                    <button className="icon-btn" onClick={() => deleteResume(r.id)} aria-label="Delete">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Personal Information</h2>
            <div className="grid-2">
              <label>Full Name
                <input value={resume.personal.name} onChange={updatePersonal("name")} placeholder="e.g. Thanmai B." />
              </label>
              <label>Email
                <input type="email" value={resume.personal.email} onChange={updatePersonal("email")} placeholder="you@email.com" />
              </label>
              <label>Phone
                <input type="tel" value={resume.personal.phone} onChange={updatePersonal("phone")} placeholder="+91 98765 43210" />
              </label>
              <label>Location
                <input value={resume.personal.location} onChange={updatePersonal("location")} placeholder="City, Country" />
              </label>
            </div>
            <label>LinkedIn / GitHub / Website
              <input value={resume.personal.link} onChange={updatePersonal("link")} placeholder="https://github.com/username" />
            </label>
          </div>

          <div className="card">
            <h2 className="card-title">Profile Summary</h2>
            <label>Summary
              <textarea rows={4} value={resume.summary} onChange={updateField("summary")}
                placeholder="Write a short professional summary about yourself..." />
            </label>
          </div>

          <div className="card">
            <h2 className="card-title">Education</h2>
            {resume.education.map((row, i) => (
              <div className="dyn-row" key={i}>
                <div className="row-grid">
                  <input placeholder="Degree / Certificate" value={row.degree} onChange={updateRow("education", i, "degree")} />
                  <input placeholder="Institution" value={row.institution} onChange={updateRow("education", i, "institution")} />
                  <input placeholder="Year (e.g. 2027)" value={row.year} onChange={updateRow("education", i, "year")} />
                  <input placeholder="Grade / GPA" value={row.grade} onChange={updateRow("education", i, "grade")} />
                </div>
                {resume.education.length > 1 && (
                  <button className="icon-btn" onClick={() => removeRow("education", i)}>✕ Remove</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addRow("education", { degree: "", institution: "", year: "", grade: "" })}>
              + Add Education
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">Work Experience</h2>
            {resume.experience.map((row, i) => (
              <div className="dyn-row" key={i}>
                <div className="row-grid">
                  <input placeholder="Job Title" value={row.title} onChange={updateRow("experience", i, "title")} />
                  <input placeholder="Company / Organisation" value={row.company} onChange={updateRow("experience", i, "company")} />
                  <input placeholder="Duration" value={row.duration} onChange={updateRow("experience", i, "duration")} />
                  <textarea rows={2} placeholder="Responsibilities / achievements" value={row.description} onChange={updateRow("experience", i, "description")} />
                </div>
                {resume.experience.length > 1 && (
                  <button className="icon-btn" onClick={() => removeRow("experience", i)}>✕ Remove</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addRow("experience", { title: "", company: "", duration: "", description: "" })}>
              + Add Experience
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">Skills</h2>
            <p className="hint">Tick any that apply, and / or type your own below.</p>
            <div className="chips">
              {SKILL_OPTIONS.map((skill) => (
                <label className="chip" key={skill}>
                  <input type="checkbox" checked={resume.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                  {skill}
                </label>
              ))}
            </div>
            <label style={{ marginTop: 12 }}>Custom skills (comma-separated)
              <input value={resume.customSkills} onChange={updateField("customSkills")} placeholder="e.g. Figma, Rust, Power BI" />
            </label>
          </div>

          <div className="card">
            <div className="row-actions">
              <button className="btn-outline" onClick={clearForm}>Clear All</button>
              <button className="btn-solid" onClick={downloadClientPdf}>⬇ Download PDF (browser)</button>
              <button className="btn-solid" onClick={downloadServerPdf}>⬇ Download PDF (server)</button>
            </div>
          </div>
        </section>

        <section className="preview-panel" aria-label="Resume preview">
          <ResumePreview resume={{ ...resume, skills: allSkills }} template={template} ref={previewRef} />
        </section>
      </main>
    </div>
  );
}
