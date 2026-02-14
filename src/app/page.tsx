"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { addProject as addProjectToFirebase, updateProject, deleteProject as deleteProjectFromFirebase } from "@/lib/firestore";
import { FirebaseTest } from "@/components/FirebaseTest";
import { RealtimeIndicator } from "@/components/RealtimeIndicator";
import { useFirebase } from "@/components/FirebaseProvider";

interface Note {
  text: string;
  status: "done" | "progress" | "problem";
  due: string;
}

interface Project {
  id?: string;
  name: string;
  location: string;
  pm: string;
  pic: string;
  picRole: string;
  due: string;
  notes: Note[];
  createdAt?: Date;
  updatedAt?: Date;
}

const initialProjects: Project[] = [
  {
    name: "Thrisna Private Lounge",
    location: "Jakarta",
    pm: "Bapak Andi",
    pic: "Pak Jhon",
    picRole: "Technician",
    due: "12 Feb 2026",
    notes: [
      { text: "Buat dudukan speaker L-CENTER-R", status: "done", due: "10 Feb 2026" },
      { text: "Perlu Multiplex 18mm ukuran 80x50", status: "progress", due: "11 Feb 2026" },
      { text: "Cek bracket Atmos Krix", status: "problem", due: "12 Feb 2026" },
    ],
  },
];

function getProjectStatus(project: Project): "done" | "progress" | "urgent" {
  if (!project.notes.length) return "progress";
  const allDone = project.notes.every((n) => n.status === "done");
  const hasProblem = project.notes.some((n) => n.status === "problem");
  if (allDone) return "done";
  if (hasProblem) return "urgent";
  return "progress";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "urgent") return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">Urgent</Badge>;
  if (status === "done") return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">Done</Badge>;
  return <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-lg">Progress</Badge>;
}

function TaskBadge({ status }: { status: string }) {
  if (status === "done") return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md text-xs">Done</Badge>;
  if (status === "problem") return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md text-xs">Problem</Badge>;
  return <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-md text-xs">Progress</Badge>;
}

function isLate(taskDue: string, projectDue: string): boolean {
  if (!taskDue || !projectDue) return false;
  const task = new Date(taskDue);
  const project = new Date(projectDue);
  return task > project;
}

function hasLateTask(project: Project): boolean {
  if (!project?.notes?.length) return false;
  return project.notes.some((n) => isLate(n.due, project.due));
}

export default function DashboardDemo() {
  const { projects, loading, error } = useFirebase();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    pm: "",
    due: "",
    pic: "",
    picRole: "",
  });

  const [newTask, setNewTask] = useState("");
  const [taskStatus, setTaskStatus] = useState<"done" | "progress" | "problem">("progress");
  const [taskDue, setTaskDue] = useState("");

  function handleAddProject() {
    if (!form.name) return;

    const newProject = {
      name: form.name,
      location: form.location,
      pm: form.pm,
      due: form.due,
      pic: form.pic,
      picRole: form.picRole,
      notes: [],
    };

    addProjectToFirebase(newProject);
    setShowAddForm(false);
    setForm({ name: "", location: "", pm: "", due: "", pic: "", picRole: "" });
  }

  function addTask() {
    if (!newTask.trim() || !selectedProject) return;

    const updatedProject = {
      ...selectedProject,
      notes: [...selectedProject.notes, { text: newTask, status: taskStatus, due: taskDue }],
    };

    updateProject(selectedProject.id!, updatedProject);
    setNewTask("");
    setTaskDue("");
  }

  function updateTaskStatus(index: number, value: "done" | "progress" | "problem") {
    if (!selectedProject) return;
    const updatedNotes = [...selectedProject.notes];
    updatedNotes[index].status = value;
    updateProject(selectedProject.id!, { ...selectedProject, notes: updatedNotes });
  }

  function deleteTask(index: number) {
    if (!selectedProject) return;
    const updatedNotes = selectedProject.notes.filter((_, i) => i !== index);
    updateProject(selectedProject.id!, { ...selectedProject, notes: updatedNotes });
  }

  function deleteProject(id: string) {
    if (!id) return;
    deleteProjectFromFirebase(id);
    if (selectedProject?.id === id) setSelectedProject(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading from Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error loading data: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-700 hover:bg-red-800 text-white">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <header className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Project Dashboard</h1>
          <p className="text-slate-300 text-lg">Manage your projects and tasks efficiently</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <RealtimeIndicator />
          </div>
        </motion.div>
      </header>
      
      {!selectedProject && (
        <>
          <FirebaseTest />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-300">Total Project</p>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                      <span className="text-blue-400 text-sm font-bold">📊</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-100">{projects.length}</h2>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-300">Progress</p>
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                      <span className="text-amber-400 text-sm font-bold">⏳</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-100">{projects.filter((p)=>getProjectStatus(p)==="progress").length}</h2>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-300">Urgent</p>
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                      <span className="text-red-400 text-sm font-bold">🚨</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-100">{projects.filter((p)=>getProjectStatus(p)==="urgent").length}</h2>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-300">Done</p>
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                      <span className="text-green-400 text-sm font-bold">✅</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-100">{projects.filter((p)=>getProjectStatus(p)==="done").length}</h2>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-slate-100">Project List</h3>
                  <Button 
                    size="sm" 
                    onClick={()=>setShowAddForm(!showAddForm)}
                    className="bg-red-700 hover:bg-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300"
                  >
                    + Add Project
                  </Button>
                </div>

                {showAddForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-600"
                  >
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="Project Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="Location" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/>
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="Project Manager" value={form.pm} onChange={(e)=>setForm({...form,pm:e.target.value})}/>
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="Due Date" value={form.due} onChange={(e)=>setForm({...form,due:e.target.value})}/>
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="PIC" value={form.pic} onChange={(e)=>setForm({...form,pic:e.target.value})}/>
                    <input className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" placeholder="PIC Role" value={form.picRole} onChange={(e)=>setForm({...form,picRole:e.target.value})}/>
                    <Button 
                      onClick={handleAddProject}
                      className="bg-red-700 hover:bg-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 h-12 rounded-xl font-semibold"
                    >
                      Save Project
                    </Button>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {projects.map((project, index)=> (
                    <motion.div 
                      key={project.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600 shadow-lg hover:shadow-xl hover:shadow-slate-500/20 transition-all duration-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-lg font-semibold text-slate-100">{project.name}</p>
                          {hasLateTask(project)&&<span className="text-red-400 text-lg animate-pulse">⚠️</span>}
                        </div>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                              <span className="text-blue-400 text-xs">📍</span>
                            </span>
                            {project.location}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                              <span className="text-purple-400 text-xs">👤</span>
                            </span>
                            PM: {project.pm}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <StatusBadge status={getProjectStatus(project)}/>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={()=>setSelectedProject(project)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-200"
                        >
                          Detail
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={()=>deleteProject(project.id!)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                        >
                          🗑️
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {selectedProject && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
          <Button 
            onClick={()=>setSelectedProject(null)}
            className="bg-red-700 hover:bg-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300"
          >
            ← Back to Projects
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-600">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">{selectedProject.name}</h2>
                    <div className="space-y-2">
                      <p className="text-slate-300 flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 text-xs">📍</span>
                        </span>
                        {selectedProject.location}
                      </p>
                      <p className="text-slate-300 flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                          <span className="text-purple-400 text-xs">👤</span>
                        </span>
                        PM: {selectedProject.pm}
                      </p>
                      <p className="text-slate-300 flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                          <span className="text-green-400 text-xs">🔧</span>
                        </span>
                        PIC: {selectedProject.pic} ({selectedProject.picRole})
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={getProjectStatus(selectedProject)}/>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-6 rounded-2xl border border-slate-600">
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-700 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">+</span>
                      </span>
                      Add New Task
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" 
                        value={newTask} 
                        onChange={(e)=>setNewTask(e.target.value)} 
                        placeholder="Tambah task..."
                      />
                      <input 
                        className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium placeholder:text-slate-400 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" 
                        value={taskDue} 
                        onChange={(e)=>setTaskDue(e.target.value)} 
                        placeholder="Due Date"
                      />
                      <select 
                        className="flex h-12 w-full rounded-xl border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" 
                        value={taskStatus} 
                        onChange={(e)=>setTaskStatus(e.target.value as "done" | "progress" | "problem")}
                      >
                        <option value="done">Done</option>
                        <option value="progress">Progress</option>
                        <option value="problem">Problem</option>
                      </select>
                      <Button 
                        onClick={addTask}
                        className="bg-red-700 hover:bg-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 h-12 rounded-xl font-semibold"
                      >
                        Add Task
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-700 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📋</span>
                      </span>
                      Site Notes & Tasks
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.notes.map((note,index)=> (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, y: -1 }}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600 shadow-md hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300"
                        >
                          <div className="flex-1">
                            <p className={`font-medium text-slate-100 ${isLate(note.due,selectedProject.due)?"text-red-400":""}`}>
                              {note.text}
                            </p>
                            <p className={`text-sm ${isLate(note.due,selectedProject.due)?"text-red-500":"text-slate-400"}`}>
                              Due: {note.due}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <TaskBadge status={note.status}/>
                            <select 
                              className="flex h-10 rounded-lg border border-slate-600 bg-slate-700/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200" 
                              value={note.status} 
                              onChange={(e)=>updateTaskStatus(index, e.target.value as "done" | "progress" | "problem")}
                            >
                              <option value="done">Done</option>
                              <option value="progress">Progress</option>
                              <option value="problem">Problem</option>
                            </select>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={()=>deleteTask(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                            >
                              🗑️
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {selectedProject.notes.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          <span className="text-4xl mb-2 block">📝</span>
                          <p>No tasks yet. Add your first task above!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
