const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function authHeaders() {
  const token = localStorage.getItem("rb_token");
  return token ? { Authorization: `Token ${token}` } : {};
}

async function request(path, { method = "GET", body, raw = false } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = Object.values(err).flat().join(" ") || detail;
    } catch {
      /* non-JSON error body, keep statusText */
    }
    throw new Error(detail);
  }

  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (username, email, password) =>
    request("/auth/register/", { method: "POST", body: { username, email, password } }),

  login: (username, password) =>
    request("/auth/login/", { method: "POST", body: { username, password } }),

  listResumes: () => request("/resumes/"),

  createResume: (payload) => request("/resumes/", { method: "POST", body: payload }),

  updateResume: (id, payload) =>
    request(`/resumes/${id}/`, { method: "PUT", body: payload }),

  deleteResume: (id) => request(`/resumes/${id}/`, { method: "DELETE" }),

  exportPdfUrl: (id) => `${BASE_URL}/resumes/${id}/export_pdf/`,

  exportPdf: async (id) => {
    const res = await request(`/resumes/${id}/export_pdf/`, { raw: true });
    return res.blob();
  },
};

export { BASE_URL };
