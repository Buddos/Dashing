export const api = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    // Determine base URL dynamically (works locally using netlify dev or in prod on netlify)
    const baseUrl = import.meta.env?.VITE_API_URL || "/.netlify/functions";
    
    // Automatically attach token from cookie or localStorage for auth
    const token = localStorage.getItem("token");
    
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || response.statusText);
    }
    
    return response.json();
  },
  
  // Helpers matching old supabase styles for easier refactoring
  from: (table: string) => ({
      select: async (query?: string) => {
          // This is a naive implementation purely to bridge simple "GET /table" 
          // Realistically, the entire React Component should be rewritten to use `api.fetch('/api/products')`
          const data = await api.fetch(`/api/${table}`);
          return { data, error: null };
      },
      insert: async (payload: any) => {
          const data = await api.fetch(`/api/${table}`, {
              method: 'POST',
              body: JSON.stringify(payload)
          });
          return { data, error: null };
      },
      update: async (payload: any) => {
           // update usually chained with .eq('id', id)
           // we'll need a different pattern or pass ID in the payload depending on the rewriting strategy
           return { data: null, error: new Error('Please rewrite update to use standard fetch') };
      }
  })
};
