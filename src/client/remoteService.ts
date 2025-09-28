import axios, { AxiosError, AxiosResponse } from 'axios';

// all references to axios are localized here

const inputPort = process.env.PORT || 4001;
let axiosClient = axios.create({ baseURL: `http://localhost:${inputPort}` });

export function setBaseURL(baseURL: string) {
  axiosClient = axios.create({ baseURL: baseURL });
}

function toError(e: unknown): Error {
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError;
    const status = err.response?.status;
    const data = err.response?.data;
    const msg = typeof data === 'string' ? data : JSON.stringify(data);
    return new Error(`${status ?? 'ERR'}: ${msg ?? err.message}`);
  }
  return new Error(String(e));
}

export async function remoteGet<T>(path: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.get(path);
    return response.data;
  } catch (e) {
    throw toError(e);
  }
}

export async function remoteDelete<T>(path: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.delete(path);
    return response.data;
  } catch (e) {
    throw toError(e);
  }
}

export async function remotePost<T>(path: string, data?: object): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.post(path, data);
    return response.data;
  } catch (e) {
    throw toError(e);
  }
}
