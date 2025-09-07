export const API = (path: string) => `http://localhost:4000${path}`;
export const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
