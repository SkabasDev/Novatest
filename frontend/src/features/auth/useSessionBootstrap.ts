import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProfile } from './authSlice';

/**
 * Revalidates a persisted JWT against the backend on app mount — never trusts the persisted
 * profile blindly (same "re-check with the server" pattern used for pending transactions).
 * An expired/invalid token is dropped silently (authSlice clears it on fetchProfile.rejected).
 */
export function useSessionBootstrap(): void {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchProfile(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
