"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";

interface TestProject {
  id?: string;
  name: string;
  location: string;
  pm: string;
  pic: string;
  picRole: string;
  due: string;
  notes: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export function FirebaseTest() {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [testProjects, setTestProjects] = useState<TestProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Test basic connection
  const testConnection = async () => {
    setStatus("testing");
    setMessage("Testing Firebase connection...");
    
    try {
      // Try to access the collection
      const testCollection = collection(db, "projects");
      const querySnapshot = await getDocs(query(testCollection, orderBy("createdAt", "desc")));
      
      setStatus("success");
      setMessage(`✅ Firebase connected! Found ${querySnapshot.docs.length} projects in database.`);
      
      // Load test projects
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TestProject[];
      setTestProjects(projects);
      
    } catch (error) {
      setStatus("error");
      setMessage(`❌ Firebase connection failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Firebase connection error:", error);
    }
  };

  // Add test data
  const addTestData = async () => {
    setIsLoading(true);
    setMessage("Adding test project...");
    
    try {
      const testProject: Omit<TestProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `Test Project ${Date.now()}`,
        location: "Test Location",
        pm: "Test PM",
        pic: "Test PIC",
        picRole: "Test Role",
        due: "2026-12-31",
        notes: [
          {
            text: "Test task 1",
            status: "progress",
            due: "2026-12-31"
          },
          {
            text: "Test task 2", 
            status: "done",
            due: "2026-12-30"
          }
        ]
      };

      const docRef = await addDoc(collection(db, "projects"), {
        ...testProject,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setMessage(`✅ Test project added! ID: ${docRef.id}`);
      await testConnection(); // Refresh list
      
    } catch (error) {
      setMessage(`❌ Failed to add test project: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Add test data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear test data
  const clearTestData = async () => {
    setIsLoading(true);
    setMessage("Clearing test data...");
    
    try {
      const projectsToDelete = testProjects.filter((p: TestProject) => p.name.includes("Test Project"));
      
      for (const project of projectsToDelete) {
        if (project.id) {
          await deleteDoc(doc(db, "projects", project.id));
        }
      }
      
      setMessage(`✅ Cleared ${projectsToDelete.length} test projects`);
      await testConnection(); // Refresh list
      
    } catch (error) {
      setMessage(`❌ Failed to clear test data: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Clear test data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test real-time sync
  const [realTimeStatus, setRealTimeStatus] = useState<"idle" | "connected" | "disconnected">("idle");
  
  useEffect(() => {
    let unsubscribe: () => void;
    
    const testRealTime = () => {
      try {
        const testCollection = collection(db, "projects");
        const q = query(testCollection, orderBy("createdAt", "desc"));
        
        unsubscribe = onSnapshot(q, (snapshot: any) => {
          setRealTimeStatus("connected");
          const projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as TestProject[];
          setTestProjects(projects);
        }, (error: any) => {
          setRealTimeStatus("disconnected");
          console.error("Real-time error:", error);
        });
        
      } catch (error) {
        setRealTimeStatus("disconnected");
        console.error("Real-time setup error:", error);
      }
    };
    
    // Start real-time test when connection is successful
    if (status === "success") {
      testRealTime();
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [status]);

  return (
    <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Firebase Connection Test</h3>
          <div className="flex gap-2">
            <Badge variant={status === "success" ? "default" : status === "error" ? "destructive" : "secondary"}>
              {status === "idle" ? "Not Tested" : status === "testing" ? "Testing..." : status === "success" ? "Connected" : "Error"}
            </Badge>
            <Badge variant={realTimeStatus === "connected" ? "default" : "secondary"}>
              {realTimeStatus === "idle" ? "Real-time: Idle" : realTimeStatus === "connected" ? "Real-time: Active" : "Real-time: Error"}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm font-mono">{message || "Click 'Test Connection' to start"}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testConnection}
              disabled={status === "testing"}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {status === "testing" ? "Testing..." : "Test Connection"}
            </Button>
            
            <Button 
              onClick={addTestData}
              disabled={status !== "success" || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Adding..." : "Add Test Data"}
            </Button>
            
            <Button 
              onClick={clearTestData}
              disabled={status !== "success" || isLoading || testProjects.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Clearing..." : "Clear Test Data"}
            </Button>
          </div>

          {testProjects.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">Projects in Database ({testProjects.length})</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {testProjects.map((project) => (
                  <div key={project.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-slate-400 text-sm">{project.location} • {project.pm}</p>
                        <p className="text-slate-500 text-xs">
                          Created: {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-slate-500 text-slate-300">
                        {project.notes?.length || 0} tasks
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
