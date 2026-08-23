"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { authApi, UserItem } from "@/lib/api";

export function useCurrentUser() {
  const { data: session, update } = useSession();

  const userId =
    session?.user?._id ||
    session?.user?.id;

  const { data: user, isLoading, refetch } = useQuery<UserItem>({
    queryKey: ["current-user-profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      return authApi.getUserById(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });

  const currentUser = user || (session?.user as UserItem | undefined) || null;

  return {
    user: currentUser,
    isLoading,
    refetch,
    session,
    update,
  };
}
