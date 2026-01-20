import api from "./api";

export async function login(email, password) {
  const response = await api.post("/login", {
    email,
    password,
  });

  const { token } = response.data;
  localStorage.setItem("token", token);

  return token;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
