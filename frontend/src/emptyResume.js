export const SKILL_OPTIONS = [
  "Python", "JavaScript", "HTML / CSS", "Java", "C++", "Django", "React",
  "SQL", "Git", "Docker", "PyTorch", "Machine Learning", "Linux", "Azure",
];

export const emptyResume = () => ({
  personal: { name: "", email: "", phone: "", location: "", link: "" },
  summary: "",
  education: [{ degree: "", institution: "", year: "", grade: "" }],
  experience: [{ title: "", company: "", duration: "", description: "" }],
  skills: [],
  customSkills: "",
});
