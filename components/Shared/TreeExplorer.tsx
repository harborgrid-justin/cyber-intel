
import React, { useState } from 'react';
import { Icons } from './Icons';

interface TreeNode {
  id: string;
  name: string;
  type: 'FILE' | 'FOLDER';
  children?: TreeNode[];
  size?: string;
}

// Recursive Component
const TreeItem: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.type === 'FOLDER' && node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-1 px-2 hover:bg-slate-800/50 cursor-pointer rounded transition-colors ${level > 0 ? 'ml-4' : ''}`}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <span className="text-slate-500">
          {node.type === 'FOLDER' ? (isOpen ? '📂' : '📁') : '📄'}
        </span>
        <span className={`text-xs font-mono ${node.type === 'FOLDER' ? 'text-slate-300 font-bold' : 'text-slate-400'}`}>
          {node.name}
        </span>
        {node.size && <span className="ml-auto text-[9px] text-slate-600">{node.size}</span>}
      </div>
      
      {isOpen && hasChildren && (
        <div className="border-l border-slate-800 ml-2">
          {node.children!.map(child => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeExplorer: React.FC<{ data: TreeNode[] }> = ({ data }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded p-2 overflow-auto max-h-96 custom-scrollbar">
      {data.map(node => <TreeItem key={node.id} node={node} level={0} />)}
    </div>
  );
};
