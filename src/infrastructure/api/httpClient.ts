import type { ApiError } from '../../domain/types';

export class ApiRequestError extends Error {
  constructor(public info: ApiError) {
    super(info.kind);
    this.name = 'ApiRequestError';
  }
}

function toError(status: number): ApiError {
  if (status === 404) return { kind: 'notFound' };
  if (status === 401) return { kind: 'unauthorized' };
  if (status === 429) return { kind: 'rateLimit' };
  return { kind: 'server', status };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ApiRequestError(toError(res.status));
  return (await res.json()) as T;
}

export const httpClient = {
  async get<T>(url: string, signal?: AbortSignal): Promise<T> {
    try {
      const res = await fetch(url, { signal });
      return await parseResponse<T>(res);
    } catch (e) {
      if (e instanceof ApiRequestError) throw e;
      throw new ApiRequestError({ kind: 'network' });
    }
  },
};
