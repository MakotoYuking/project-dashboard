import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Collection reference
const projectsCollection = collection(db, "projects");

// Types
export interface Project {
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

export interface Note {
  id?: string;
  text: string;
  status: "done" | "progress" | "problem";
  due: string;
  createdAt?: Date;
}

// Project CRUD operations
export const getProjects = async () => {
  const querySnapshot = await getDocs(query(projectsCollection, orderBy("createdAt", "desc")));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Project[];
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(projectsCollection, {
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return {
    id: docRef.id,
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  const projectRef = doc(db, "projects", id);
  await updateDoc(projectRef, {
    ...project,
    updatedAt: new Date()
  });
  return { id, ...project, updatedAt: new Date() };
};

export const deleteProject = async (id: string) => {
  const projectRef = doc(db, "projects", id);
  await deleteDoc(projectRef);
};

// Real-time listener with change detection
export const subscribeToProjects = (callback: (projects: Project[]) => void, errorCallback?: (error: Error) => void, changeCallback?: (changeType: string, data: any) => void) => {
  const q = query(projectsCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, 
    (querySnapshot) => {
      const projects = querySnapshot.docChanges().map((change) => {
        const project = {
          id: change.doc.id,
          ...change.doc.data()
        } as Project;
        
        // Notify about specific changes
        if (changeCallback) {
          switch (change.type) {
            case 'added':
              changeCallback('added', project);
              break;
            case 'modified':
              changeCallback('modified', project);
              break;
            case 'removed':
              changeCallback('removed', project);
              break;
          }
        }
        
        return project;
      });
      
      // Get all projects for full update
      const allProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      callback(allProjects);
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

// Real-time listener for single project
export const subscribeToProject = (projectId: string, callback: (project: Project) => void, errorCallback?: (error: Error) => void) => {
  const projectRef = doc(db, "projects", projectId);
  return onSnapshot(projectRef, 
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const project = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as Project;
        callback(project);
      }
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};
