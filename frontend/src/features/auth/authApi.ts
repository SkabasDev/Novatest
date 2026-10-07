import { http } from '../../services/http';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  defaultAddress: string | null;
  defaultCity: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  fetchProfile: async (token: string): Promise<UserProfile> => {
    const { data } = await http.get<UserProfile>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
