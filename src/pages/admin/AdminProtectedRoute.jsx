import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import FullScreenLoader from "@/components/FullScreenLoader";

export default function AdminProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!alive) return;
        if (error || !data?.user) { setAllowed(false); return; }
        const isAdmin = !!data.user.app_metadata?.is_admin;
        setAllowed(isAdmin);
      } catch {
        setAllowed(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (allowed === null) return <FullScreenLoader />;
  if (!allowed) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
