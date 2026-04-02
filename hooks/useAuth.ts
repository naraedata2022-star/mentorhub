// @TASK P1-R1-T1 - useAuth React 훅
// @SPEC docs/planning/02-trd.md#인증-API

"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOut as authSignOut,
} from "@/lib/supabase/auth";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

/**
 * 현재 유저/세션 상태를 관리하는 React 훅.
 *
 * - 컴포넌트 마운트 시 세션을 확인합니다.
 * - Supabase auth 상태 변경을 구독합니다.
 * - 로그인/로그아웃/회원가입 함수를 제공합니다.
 *
 * @returns {object} { user, session, isLoading, signIn, signUp, signInOAuth, signOut }
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    // auth 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      return signInWithEmail(email, password);
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      return signUpWithEmail(email, password, name);
    },
    []
  );

  const signInOAuth = useCallback(
    async (provider: "google" | "kakao") => {
      return signInWithOAuth(provider);
    },
    []
  );

  const signOut = useCallback(async () => {
    return authSignOut();
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    signIn,
    signUp,
    signInOAuth,
    signOut,
  };
}
