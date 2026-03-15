import { useAuth } from "@/contexts/AuthContext";

export const useSellerCheck = () => {
  const { user, role, loading: authLoading } = useAuth();
  const isSeller = user !== null && (role === "admin" || role === "seller");
  return { isSeller, loading: authLoading };
};
