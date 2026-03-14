import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSellerCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsSeller(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "seller",
      });
      setIsSeller(!error && data === true);
      setLoading(false);
    };

    if (!authLoading) check();
  }, [user, authLoading]);

  return { isSeller, loading: loading || authLoading };
};
