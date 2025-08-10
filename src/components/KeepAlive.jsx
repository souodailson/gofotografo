// src/components/KeepAlive.jsx
import React, { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/authContext.jsx";

export default function KeepAlive() {
  const { user } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!user) return;

    const keepAliveInterval = 240000; // 4 min

    const ping = async () => {
      try {
        const { error } = await supabase
          .from("settings")
          .select("user_id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .limit(1);
        if (error) console.warn("KeepAlive: ping falhou:", error.message);
      } catch (e) {
        console.warn("KeepAlive: erro no ping:", e);
      }
    };

    ping();
    intervalRef.current = setInterval(ping, keepAliveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id]);

  return null;
}
