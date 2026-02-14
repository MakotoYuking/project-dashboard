"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToProjects, Project } from "@/lib/firestore";

interface FirebaseContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  changeType: string | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [changeType, setChangeType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProjects(
      (fetchedProjects) => {
        setProjects(fetchedProjects);
        setLoading(false);
        setLastUpdate(new Date());
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      (changeType: string, data: any) => {
        setChangeType(changeType);
        setLastUpdate(new Date());
        
        // Clear change type after 3 seconds
        setTimeout(() => setChangeType(null), 3000);
      }
    );

    return () => unsubscribe();
  }, []);

  const value: FirebaseContextType = {
    projects,
    loading,
    error,
    lastUpdate,
    changeType
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
