import { forwardRef } from "react";

const ResumePreview = forwardRef(function ResumePreview({ resume, template }, ref) {
  const { personal, summary, education, experience, skills } = resume;

  const contactBits = [personal.email, personal.phone, personal.location].filter(Boolean);
  const link = personal.link
    ? personal.link.startsWith("http")
      ? personal.link
      : `https://${personal.link}`
    : null;

  return (
    <div className={`resume tpl-${template}`} id="resume" ref={ref}>
      <div className="r-head">
        <h1>{personal.name || "Your Name"}</h1>
        <div className="r-contact">
          {contactBits.map((bit, i) => (
            <span key={i}>{bit}</span>
          ))}
          {link && (
            <a href={link} target="_blank" rel="noreferrer">
              {personal.link}
            </a>
          )}
        </div>
      </div>

      <div className="r-sec">
        <h2 className="r-sec-title">Profile</h2>
        <p className="r-summary-text">{summary || "Your summary will appear here."}</p>
      </div>

      {education.some((r) => r.degree || r.institution) && (
        <div className="r-sec">
          <h2 className="r-sec-title">Education</h2>
          {education
            .filter((r) => r.degree || r.institution)
            .map((row, i) => (
              <div className="r-item" key={i}>
                <div className="r-item-top">
                  <strong>{row.degree}</strong>
                  <span>{row.year}</span>
                </div>
                <div className="r-item-sub">
                  {row.institution}
                  {row.grade ? ` · ${row.grade}` : ""}
                </div>
              </div>
            ))}
        </div>
      )}

      {experience.some((r) => r.title || r.company) && (
        <div className="r-sec">
          <h2 className="r-sec-title">Experience</h2>
          {experience
            .filter((r) => r.title || r.company)
            .map((row, i) => (
              <div className="r-item" key={i}>
                <div className="r-item-top">
                  <strong>{row.title}</strong>
                  <span>{row.duration}</span>
                </div>
                <div className="r-item-sub">{row.company}</div>
                {row.description && <p className="r-item-desc">{row.description}</p>}
              </div>
            ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="r-sec">
          <h2 className="r-sec-title">Skills</h2>
          <div className="r-skills">
            {skills.map((s) => (
              <span className="r-skill-tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ResumePreview;
