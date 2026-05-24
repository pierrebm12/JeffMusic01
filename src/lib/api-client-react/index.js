import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Query key getters
export function getHomeDataQueryKey() { return ["home"]; }
export function getListShowsQueryKey() { return ["shows"]; }
export function getListPhotosQueryKey() { return ["photos"]; }
export function getListVideosQueryKey() { return ["videos"]; }

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

export function useHomeData() {
  return useQuery({
    queryKey: getHomeDataQueryKey(),
    queryFn: () => fetchWithTimeout(`${API_URL}/home`),
    staleTime: 30_000,
    retry: 2,
  });
}

// Shows hooks
export function useListShows() {
  return useQuery({
    queryKey: getListShowsQueryKey(),
    queryFn: () => fetchWithTimeout(`${API_URL}/shows`),
    retry: 2,
  });
}

export function useCreateShow({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch(`${API_URL}/shows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create show");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListShowsQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useUpdateShow({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_URL}/shows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update show");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListShowsQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useDeleteShow({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const res = await fetch(`${API_URL}/shows/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete show");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListShowsQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

// Photos hooks
export function useListPhotos() {
  return useQuery({
    queryKey: getListPhotosQueryKey(),
    queryFn: () => fetchWithTimeout(`${API_URL}/photos`),
    retry: 2,
  });
}

export function useCreatePhoto({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch(`${API_URL}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create photo");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPhotosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useUpdatePhoto({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_URL}/photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update photo");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPhotosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useDeletePhoto({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const res = await fetch(`${API_URL}/photos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete photo");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPhotosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

// Videos hooks
export function useListVideos() {
  return useQuery({
    queryKey: getListVideosQueryKey(),
    queryFn: () => fetchWithTimeout(`${API_URL}/videos`),
    retry: 2,
  });
}

export function useCreateVideo({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch(`${API_URL}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create video");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListVideosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useUpdateVideo({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_URL}/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update video");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListVideosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useDeleteVideo({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const res = await fetch(`${API_URL}/videos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete video");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListVideosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

// Admin hooks
export function useAdminLogin({ mutation } = {}) {
  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Invalid password");
      return res.json();
    },
    onSuccess: mutation?.onSuccess,
    onError: mutation?.onError,
  });
}

export function useAdminLogout({ mutation } = {}) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: mutation?.onSuccess,
    onError: mutation?.onError,
  });
}

// Sections hooks
export function getListSectionsQueryKey() { return ["sections"]; }

export function useListSections() {
  return useQuery({
    queryKey: getListSectionsQueryKey(),
    queryFn: () => fetchWithTimeout(`${API_URL}/sections`),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useUpdateSection({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, data }) => {
      const res = await fetch(`${API_URL}/sections/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update section");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListSectionsQueryKey() });
      qc.invalidateQueries({ queryKey: getHomeDataQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

// Upload hooks
export function useUploadPhoto({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title, titleEn, sortOrder }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (titleEn) formData.append("titleEn", titleEn);
      if (sortOrder !== undefined) formData.append("sortOrder", sortOrder);

      const res = await fetch(`${API_URL}/upload/photo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload photo");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListPhotosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}

export function useUploadVideo({ mutation } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title, titleEn, sortOrder }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (titleEn) formData.append("titleEn", titleEn);
      if (sortOrder !== undefined) formData.append("sortOrder", sortOrder);

      const res = await fetch(`${API_URL}/upload/video`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload video");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListVideosQueryKey() });
      mutation?.onSuccess?.();
    },
    onError: mutation?.onError,
  });
}
