export function useApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("VITE_API_URL environment variable is not set");
  }
  return apiUrl;
}
