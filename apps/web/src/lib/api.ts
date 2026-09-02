const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getFullUrl(endpoint: string): string {
  let base = RAW_API_URL.trim().replace(/\/+$/, '');
  if (!base.endsWith('/api') && !base.includes('/api/')) {
    base = `${base}/api`;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
  tenantId?: string | null
): Promise<{ success: boolean; data?: T; error?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('barber_token') : null);

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  const url = getFullUrl(endpoint);

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }

    return {
      success: false,
      error: res.status >= 400
        ? `Erro do servidor (${res.status}): ${res.statusText || 'Resposta em formato HTML ou inválida'}`
        : 'A resposta da API não está em formato JSON.',
    };
  } catch (err: any) {
    console.error('[API Log] Erro de conexão:', err);
    return {
      success: false,
      error: 'Falha ao conectar, tente novamente',
    };
  }
}
