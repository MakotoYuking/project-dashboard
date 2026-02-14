"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useFirebase } from "@/components/FirebaseProvider";

export function RealtimeIndicator() {
  const { lastUpdate, changeType } = useFirebase();

  if (!lastUpdate) return null;

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'modified':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'removed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getChangeText = (type: string) => {
    switch (type) {
      case 'added':
        return 'New project added';
      case 'modified':
        return 'Project updated';
      case 'removed':
        return 'Project deleted';
      default:
        return 'Data updated';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
        </div>
        <span className="text-xs text-slate-400">Live</span>
      </div>

      {/* Change notification */}
      {changeType && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2"
        >
          <Badge 
            variant="outline" 
            className={`text-xs ${getChangeColor(changeType)}`}
          >
            {getChangeText(changeType)}
          </Badge>
        </motion.div>
      )}

      {/* Last update time */}
      <div className="text-xs text-slate-500">
        {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}
