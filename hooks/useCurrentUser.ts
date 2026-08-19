"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { authApi, UserItem } from "@/lib/api";

export function useCurrentUser() {
  const { data: session, update } = useSession();

  const userId =
    session?.user?._id ||
    session?.user?.id ||
    "6a852dd213d863acd80c9b08";

  const { data: user, isLoading, refetch } = useQuery<UserItem>({
    queryKey: ["current-user-profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const res = await authApi.getUserById(userId);
      return res?.data || res;
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });

  const currentUser = user || (session?.user as any) || null;

  return {
    user: currentUser,
    isLoading,
    refetch,
    session,
    update,
  };
}
