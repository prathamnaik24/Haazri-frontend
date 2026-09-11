import React, { useState, useRef, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  Users, 
  Briefcase, 
  Layers, 
  Info, 
  Maximize, 
  Minimize, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Search, 
  Filter, 
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  History,
  Building2
} from 'lucide-react';
import api from '../../services/api.js';
import { canManageHierarchy, getUserFromToken } from '../../utils/auth.js';

// Predefined fallback sample data used if backend has 0 positions yet
const initialOrgData = {
  'ceo': { 
    id: 'ceo', 
    name: 'Eleanor Vance', 
    role: 'Chief Executive Officer', 
    department: 'Executive', 
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 
    email: 'e.vance@haazri.com',
    phone: '+1 (555) 012-4920',
    connections: { down: ['vp-prod', 'vp-eng'] } 
  },
  'vp-prod': { 
    id: 'vp-prod', 
    name: 'Michael Ross', 
    role: 'VP of Product', 
    department: 'Product', 
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', 
    email: 'm.ross@haazri.com',
    phone: '+1 (555) 014-8832',
    connections: { up: ['ceo'], down: ['dir-design', 'dir-pm'], right: ['vp-eng'] } 
  },
  'vp-eng': { 
    id: 'vp-eng', 
    name: 'Harvey Specter', 
    role: 'VP of Engineering', 
    department: 'Engineering', 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 
    email: 'h.specter@haazri.com',
    phone: '+1 (555) 019-3382',
    connections: { up: ['ceo'], left: ['vp-prod'], down: ['dir-eng'] } 
  },
  'dir-design': { 
    id: 'dir-design', 
    name: 'David Chen', 
    role: 'Director of Design', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
    email: 'd.chen@haazri.com',
    phone: '+1 (555) 017-9921',
    connections: { up: ['vp-prod'], down: ['me', 'peer1', 'peer2'], right: ['dir-pm'] } 
  },
  'dir-pm': { 
    id: 'dir-pm', 
    name: 'Louis Litt', 
    role: 'Director of Product', 
    department: 'Product', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 
    email: 'l.litt@haazri.com',
    phone: '+1 (555) 016-7731',
    connections: { up: ['vp-prod'], left: ['dir-design'], down: ['pm1', 'pm2'] } 
  },
  'dir-eng': { 
    id: 'dir-eng', 
    name: 'Jessica Pearson', 
    role: 'Director of Engineering', 
    department: 'Engineering', 
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 
    email: 'j.pearson@haazri.com',
    phone: '+1 (555) 018-4491',
    connections: { up: ['vp-eng'], down: ['lead1'] } 
  },
  'me': { 
    id: 'me', 
    name: 'Priya Sharma', 
    role: 'Senior Product Designer', 
    department: 'Design', 
    email: 'p.sharma@haazri.com', 
    phone: '+1 (555) 019-3829', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 
    status: 'online', 
    connections: { up: ['dir-design'], down: ['rep1', 'rep2', 'rep3'], left: ['peer1'], right: ['lead1'] } 
  },
  'peer1': { 
    id: 'peer1', 
    name: 'Emma Davis', 
    role: 'Senior Product Designer', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
    email: 'e.davis@haazri.com', 
    connections: { right: ['me'] } 
  },
  'peer2': { 
    id: 'peer2', 
    name: 'Noah Wilson', 
    role: 'Product Designer II', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 
    email: 'n.wilson@haazri.com', 
    connections: { right: ['peer1'] } 
  },
  'lead1': { 
    id: 'lead1', 
    name: 'Chris Evans', 
    role: 'Lead Frontend Eng', 
    department: 'Engineering', 
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 
    email: 'c.evans@haazri.com', 
    connections: { up: ['dir-eng'], left: ['me'], down: ['dev1', 'dev2'] } 
  },
  'pm1': { 
    id: 'pm1', 
    name: 'Mike Ross Jr', 
    role: 'Product Manager', 
    department: 'Product', 
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', 
    email: 'm.ross.jr@haazri.com', 
    connections: { up: ['dir-pm'] } 
  },
  'pm2': { 
    id: 'pm2', 
    name: 'Rachel Zane', 
    role: 'Associate PM', 
    department: 'Product', 
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', 
    email: 'r.zane@haazri.com', 
    connections: { up: ['dir-pm'] } 
  },
  'dev1': { 
    id: 'dev1', 
    name: 'Steve Rogers', 
    role: 'Frontend Developer', 
    department: 'Engineering', 
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 
    email: 's.rogers@haazri.com', 
    connections: { up: ['lead1'] } 
  },
  'dev2': { 
    id: 'dev2', 
    name: 'Tony Stark', 
    role: 'Systems Architect', 
    department: 'Engineering', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 
    email: 't.stark@haazri.com', 
    connections: { up: ['lead1'] } 
  },
  'rep1': { 
    id: 'rep1', 
    name: 'Alex Johnson', 
    role: 'Product Designer', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 
    email: 'a.johnson@haazri.com', 
    connections: { up: ['me'], down: ['intern1'] } 
  },
  'rep2': { 
    id: 'rep2', 
    name: 'Sam Taylor', 
    role: 'UX Researcher', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=150&auto=format&fit=crop&q=80', 
    email: 's.taylor@haazri.com', 
    connections: { up: ['me'] } 
  },
  'rep3': { 
    id: 'rep3', 
    name: 'Jordan Smith', 
    role: 'UI Designer', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80', 
    email: 'j.smith@haazri.com', 
    connections: { up: ['me'] } 
  },
  'intern1': { 
    id: 'intern1', 
    name: 'Jamie Doe', 
    role: 'Design Intern', 
    department: 'Design', 
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 
    email: 'j.doe@haazri.com', 
    connections: { up: ['rep1'] } 
  }
};

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
];

function getAvatarForId(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}

/**
 * Transforms a nested backend hierarchy tree into a 4-way radial dictionary
 */
function transformBackendHierarchy(roots = [], currentPersonId = null) {
  if (!roots || roots.length === 0) return { map: {}, detectedMeId: null, rootKey: null };

  const map = {};
  const parentMap = {};
  const childrenMap = {};
  let detectedMeId = null;

  function traverse(node, parentKey = null, currentDepth = 0) {
    if (!node || !node.id) return;

    const isMe = Boolean(
      node.employee?.id && currentPersonId && String(node.employee.id) === String(currentPersonId)
    );
    const key = isMe ? 'me' : String(node.id);
    if (isMe) detectedMeId = 'me';

    const empName = node.employee 
      ? `${node.employee.first_name || ''} ${node.employee.last_name || ''}`.trim()
      : null;

    map[key] = {
      id: key,
      backendPositionId: node.id,
      name: empName || node.title,
      role: node.title,
      department: node.department?.name || 'General',
      email: node.employee?.email || '',
      phone: '',
      avatar: getAvatarForId(key),
      status: isMe ? 'online' : 'active',
      isMe,
      depth: currentDepth,
      employeeId: node.employee?.id || null,
      rawEmployee: node.employee || null,
      connections: { up: [], down: [], left: [], right: [] }
    };

    if (parentKey) {
      parentMap[key] = parentKey;
      if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
      childrenMap[parentKey].push(key);
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child, key, currentDepth + 1));
    }
  }

  roots.forEach(r => traverse(r, null, 0));

  // Build radial 4-way connections
  for (const key of Object.keys(map)) {
    const parentKey = parentMap[key];
    if (parentKey) {
      map[key].connections.up = [parentKey];

      // Siblings reporting to same parent (peers)
      const siblings = (childrenMap[parentKey] || []).filter(sib => sib !== key);
      const half = Math.ceil(siblings.length / 2);
      map[key].connections.left = siblings.slice(0, half);
      map[key].connections.right = siblings.slice(half);
    }
    if (childrenMap[key]) {
      map[key].connections.down = childrenMap[key];
    }
  }

  const defaultRoot = roots[0] ? (detectedMeId || String(roots[0].id)) : null;
  return { map, detectedMeId, rootKey: defaultRoot };
}

const OrgContext = createContext();

// ── Generic Modal Helper ──
function AdminModal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl ${maxWidth} w-full shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]`}>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Employee Card Component ──
const EmployeeCard = ({ nodeId, blockedDirections = [], filteredConnections = null }) => {
  const { 
    orgData, 
    expandedState, 
    toggleExpand, 
    openAddChild, 
    openEdit, 
    openDelete, 
    openMobility,
    canManage, 
    focusedNodeId, 
    activeDepartment 
  } = useContext(OrgContext);

  const employee = orgData[nodeId];
  const isExpanded = expandedState[nodeId] || {};
  const isMe = employee?.isMe || nodeId === 'me';
  const isFocal = nodeId === focusedNodeId;
  const isDimmed = activeDepartment !== 'All' && employee?.department !== activeDepartment;

  if (!employee) return null;

  // Use dynamically filtered connections when rendered in tree so visited ancestors/peers are omitted
  const activeConnections = filteredConnections || employee.connections || {};

  const renderChevron = (dir, count, label, Icon) => {
    if (blockedDirections.includes(dir) || !count) return null;
    
    const expanded = isExpanded[dir];
    const positions = {
      up: 'absolute -top-3 left-1/2 transform -translate-x-1/2',
      down: 'absolute -bottom-3 left-1/2 transform -translate-x-1/2',
      left: 'absolute top-1/2 -left-4 transform -translate-y-1/2',
      right: 'absolute top-1/2 -right-4 transform -translate-y-1/2',
    };

    return (
      <button 
        onClick={(e) => { e.stopPropagation(); toggleExpand(nodeId, dir); }}
        className={`
          ${positions[dir]}
          bg-white hover:bg-blue-50 text-slate-600 hover:text-[#1677B8]
          rounded-full px-2.5 py-1 flex items-center space-x-1 text-[11px] font-semibold
          border border-slate-200 shadow-sm transition-all z-20 whitespace-nowrap
          ${expanded ? 'bg-blue-50 text-[#1677B8] border-blue-300 shadow-inner' : ''}
        `}
      >
        {dir === 'left' && <Icon size={12} className={expanded ? 'rotate-180' : ''} />}
        <span>{count} {label}{count > 1 ? 's' : ''}</span>
        {dir !== 'left' && <Icon size={12} className={expanded ? 'rotate-180' : ''} />}
      </button>
    );
  };

  return (
    <div className={`
      group relative bg-white rounded-xl shadow-md border-2 
      ${isFocal 
        ? 'border-[#1677B8] shadow-blue-200 ring-4 ring-blue-50' 
        : isMe 
        ? 'border-indigo-400 shadow-indigo-100 ring-2 ring-indigo-50' 
        : 'border-slate-200 hover:border-slate-300'} 
      ${isDimmed ? 'opacity-35 grayscale transition-opacity' : 'opacity-100'}
      p-4 w-[280px] transition-all duration-300 z-10 animate-[fadeIn_0.3s_ease-out]
    `}>
      
      {/* Directional Expansion Chevrons */}
      {renderChevron('up', activeConnections.up?.length, 'manager', ChevronUp)}
      {renderChevron('down', activeConnections.down?.length, 'report', ChevronDown)}
      {renderChevron('left', activeConnections.left?.length, 'peer', ChevronLeft)}
      {renderChevron('right', activeConnections.right?.length, 'lead', ChevronRight)}

      {/* Admin Action & Mobility Bar */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-slate-50/95 backdrop-blur-sm p-1 rounded-lg border border-slate-200 z-30 shadow-sm">
        {employee.employeeId && (
          <button 
            onClick={(e) => { e.stopPropagation(); openMobility(employee); }}
            title="View Mobility History"
            className="p-1 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded"
          >
            <History size={13} />
          </button>
        )}
        {canManage && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); openAddChild(employee); }} 
              title="Add Subordinate Position" 
              className="p-1 hover:bg-blue-50 text-slate-600 hover:text-[#1677B8] rounded"
            >
              <Plus size={13} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); openEdit(employee); }} 
              title="Edit Position" 
              className="p-1 hover:bg-slate-200 text-slate-600 rounded"
            >
              <Edit3 size={13} />
            </button>
            {!isMe && (
              <button 
                onClick={(e) => { e.stopPropagation(); openDelete(employee); }} 
                title="Remove Position" 
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 size={13} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Card Header & Body */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative flex-shrink-0">
          <img 
            src={employee.avatar} 
            alt={employee.name} 
            className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
          />
          {employee.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-bold text-slate-900 truncate leading-tight">{employee.name}</h3>
            {isMe && (
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                YOU
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-600 truncate mt-0.5">{employee.role}</p>
          <p className="text-[11px] font-semibold text-[#1677B8] tracking-wide uppercase mt-1">{employee.department}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
        {employee.email ? (
          <div className="flex items-center text-[12px] text-slate-500">
            <Mail size={12} className="mr-2 text-slate-400 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        ) : (
          <div className="flex items-center text-[12px] text-slate-400 italic">
            <span className="truncate">Open Position (Unassigned)</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Recursive Tree Node with Directional Lines, Cycle Prevention & Capped Siblings ──
const SIBLING_PREVIEW_LIMIT = 4;
const DIRECT_REPORT_PREVIEW_LIMIT = 8;

const TreeNode = ({ nodeId, blockedDirections = [], visitedPath = new Set(), depth = 0 }) => {
  const { orgData, expandedState } = useContext(OrgContext);
  const [showAllLeft, setShowAllLeft] = useState(false);
  const [showAllRight, setShowAllRight] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  const employee = orgData[nodeId];
  const isExpanded = expandedState[nodeId] || {};

  // 1. Cycle & depth protection
  if (!employee || visitedPath.has(nodeId) || depth > 20) {
    return null;
  }

  // Create child visited path
  const currentVisited = new Set(visitedPath);
  currentVisited.add(nodeId);

  // Filter valid connections that are not in the visited ancestor path
  const upConnections = (employee.connections?.up || []).filter(id => !currentVisited.has(id));
  const leftConnections = (employee.connections?.left || []).filter(id => !currentVisited.has(id));
  const rightConnections = (employee.connections?.right || []).filter(id => !currentVisited.has(id));
  const downConnections = (employee.connections?.down || []).filter(id => !currentVisited.has(id));

  const visibleLeft = showAllLeft ? leftConnections : leftConnections.slice(0, SIBLING_PREVIEW_LIMIT);
  const visibleRight = showAllRight ? rightConnections : rightConnections.slice(0, SIBLING_PREVIEW_LIMIT);
  const visibleDown = showAllReports ? downConnections : downConnections.slice(0, DIRECT_REPORT_PREVIEW_LIMIT);

  return (
    <div className="flex flex-col items-center relative">
      
      {/* UPWARD (Managers) */}
      {isExpanded.up && !blockedDirections.includes('up') && upConnections.length > 0 && (
        <div className="flex flex-col items-center mb-2 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex justify-center items-end pb-4 relative">
            {upConnections.map((parentId, index, arr) => (
              <div key={parentId} className="relative flex flex-col items-center px-4">
                <div className="mb-2">
                  <TreeNode 
                    nodeId={parentId} 
                    blockedDirections={['down']} 
                    visitedPath={currentVisited} 
                    depth={depth + 1} 
                  />
                </div>
                <div className="w-px h-6 bg-slate-300" />
                {arr.length > 1 && (
                  <div className="absolute bottom-0 h-px bg-slate-300"
                       style={{
                         left: index === 0 ? '50%' : '0',
                         right: index === arr.length - 1 ? '50%' : '0'
                       }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-300" />
        </div>
      )}

      {/* HORIZONTAL LEVEL (Peers - Center - Leads) */}
      <div className="flex items-center relative z-10">
        
        {/* Left Peers */}
        {isExpanded.left && !blockedDirections.includes('left') && leftConnections.length > 0 && (
          <div className="flex items-center mr-6 animate-[fadeIn_0.3s_ease-out]">
            {leftConnections.length > SIBLING_PREVIEW_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllLeft(prev => !prev)}
                className="mr-2 px-2 py-1 text-[10px] font-semibold bg-blue-50 text-[#1677B8] hover:bg-blue-100 border border-blue-200 rounded-full transition shadow-sm whitespace-nowrap"
              >
                {showAllLeft ? 'Show Less' : `+${leftConnections.length - SIBLING_PREVIEW_LIMIT} more`}
              </button>
            )}
            {visibleLeft.map((peerId) => (
              <div key={peerId} className="flex items-center">
                <TreeNode 
                  nodeId={peerId} 
                  blockedDirections={['left', 'right', 'up', 'down']} 
                  visitedPath={currentVisited} 
                  depth={depth + 1} 
                />
                <div className="w-8 h-px bg-slate-300" />
              </div>
            ))}
          </div>
        )}

        {/* Center Node Component */}
        <EmployeeCard 
          nodeId={nodeId} 
          blockedDirections={blockedDirections}
          filteredConnections={{
            up: upConnections,
            down: downConnections,
            left: leftConnections,
            right: rightConnections
          }}
        />

        {/* Right Peers/Leads */}
        {isExpanded.right && !blockedDirections.includes('right') && rightConnections.length > 0 && (
          <div className="flex items-center ml-6 animate-[fadeIn_0.3s_ease-out]">
            {visibleRight.map((peerId) => (
              <div key={peerId} className="flex items-center">
                <div className="w-8 h-px bg-slate-300" />
                <TreeNode 
                  nodeId={peerId} 
                  blockedDirections={['left', 'right', 'up', 'down']} 
                  visitedPath={currentVisited} 
                  depth={depth + 1} 
                />
              </div>
            ))}
            {rightConnections.length > SIBLING_PREVIEW_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllRight(prev => !prev)}
                className="ml-2 px-2 py-1 text-[10px] font-semibold bg-blue-50 text-[#1677B8] hover:bg-blue-100 border border-blue-200 rounded-full transition shadow-sm whitespace-nowrap"
              >
                {showAllRight ? 'Show Less' : `+${rightConnections.length - SIBLING_PREVIEW_LIMIT} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* DOWNWARD (Reports) */}
      {isExpanded.down && !blockedDirections.includes('down') && downConnections.length > 0 && (
        <div className="flex flex-col items-center mt-2 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-px h-6 bg-slate-300" />
          
          <div className="flex justify-center items-start pt-4 relative">
            {visibleDown.map((childId, index, arr) => (
              <div key={childId} className="relative flex flex-col items-center px-4">
                {arr.length > 1 && (
                  <div className="absolute top-0 h-px bg-slate-300"
                       style={{
                         left: index === 0 ? '50%' : '0',
                         right: index === arr.length - 1 ? '50%' : '0'
                       }}
                  />
                )}
                <div className="w-px h-6 bg-slate-300" />
                <div className="mt-2">
                  <TreeNode 
                    nodeId={childId} 
                    blockedDirections={['up']} 
                    visitedPath={currentVisited} 
                    depth={depth + 1} 
                  />
                </div>
              </div>
            ))}
          </div>

          {downConnections.length > DIRECT_REPORT_PREVIEW_LIMIT && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAllReports(prev => !prev)}
                className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-blue-50 text-[#1677B8] border border-slate-200 hover:border-blue-300 rounded-full transition shadow-sm"
              >
                {showAllReports 
                  ? 'Show fewer direct reports' 
                  : `Show all ${downConnections.length} direct reports`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function OrgStructure() {
  const canManage = canManageHierarchy();
  const currentUser = getUserFromToken();

  // Primary live state
  const [orgData, setOrgData] = useState(initialOrgData);
  const [rootNodeId, setRootNodeId] = useState('me');
  const [focusedNodeId, setFocusedNodeId] = useState('me');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackNotice, setFeedbackNotice] = useState(null); // { type: 'success'|'error', text: '' }

  // Expanded nodes map
  const [expandedState, setExpandedState] = useState({
    'me': { up: true, down: true, left: false, right: false }
  });
  const [showHint, setShowHint] = useState(true);
  
  // Canvas Pan & Zoom
  const [transform, setTransform] = useState({ x: 0, y: 40, scale: 0.95 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 40 });
  const containerRef = useRef(null);

  // Floating Toolbar & Drawers
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Modals State
  const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit' | 'delete' | 'templates' | 'mobility'
  const [targetNode, setTargetNode] = useState(null);
  const [modalForm, setModalForm] = useState({ title: '', name: '', role: '', department: '', email: '' });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Starter Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('corporate');

  // Mobility Audit state
  const [mobilityEmployee, setMobilityEmployee] = useState(null);
  const [mobilityHistory, setMobilityHistory] = useState([]);
  const [mobilityLoading, setMobilityLoading] = useState(false);

  // Show transient notice
  const triggerNotice = useCallback((text, type = 'success') => {
    setFeedbackNotice({ text, type });
    setTimeout(() => setFeedbackNotice(null), 4000);
  }, []);

  // ── Load live backend hierarchy ──
  const fetchLiveHierarchy = useCallback(async () => {
    setLoading(true);
    try {
      const [hierRes, tempRes] = await Promise.all([
        api.get('/org/hierarchy'),
        api.get('/admin/org-structure/templates').catch(() => ({ data: { data: [] } }))
      ]);

      const backendRoots = hierRes.data?.data || [];
      setTemplates(tempRes.data?.data || []);

      if (Array.isArray(backendRoots) && backendRoots.length > 0) {
        const { map, detectedMeId, rootKey } = transformBackendHierarchy(
          backendRoots, 
          currentUser?.person_id
        );

        if (Object.keys(map).length > 0) {
          setOrgData(map);
          const initialFocus = detectedMeId || rootKey || Object.keys(map)[0];
          setRootNodeId(initialFocus);
          setFocusedNodeId(initialFocus);
          setExpandedState({
            [initialFocus]: { up: true, down: true, left: true, right: true }
          });
          setIsLiveConnected(true);
        }
      } else {
        // Backend has 0 positions configured yet
        setIsLiveConnected(false);
      }
    } catch (err) {
      console.warn('Could not fetch live backend hierarchy, falling back to local sandbox data:', err.message);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.person_id]);

  useEffect(() => {
    fetchLiveHierarchy();
  }, [fetchLiveHierarchy]);

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set(Object.values(orgData).map(d => d.department).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [orgData]);

  // Filtered employees for directory search
  const directoryEmployees = useMemo(() => {
    const list = Object.values(orgData);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.role.toLowerCase().includes(q) || 
      e.department?.toLowerCase().includes(q)
    );
  }, [orgData, searchQuery]);

  // Focus canvas on specific employee
  // Focus canvas on specific employee (used by People Directory)
  const focusOnEmployee = (nodeId) => {
    setFocusedNodeId(nodeId);
    setRootNodeId(nodeId);
    // Prune expanded state to only the focused employee to minimize CPU and DOM load
    setExpandedState({
      [nodeId]: { up: true, down: true, left: true, right: true }
    });
    setTransform({ x: 0, y: 40, scale: 0.95 });
    setDirectoryOpen(false);
  };

  // Select department and immediately focus camera on the Department Head
  const selectDepartment = (dept) => {
    setActiveDepartment(dept);
    setDeptMenuOpen(false);

    if (dept === 'All') {
      resetView();
      return;
    }

    // Find all nodes in this department
    const deptNodes = Object.values(orgData).filter(n => n.department === dept);
    if (deptNodes.length === 0) return;

    // Determine the department head: lowest depth, or role containing 'Director' / 'Head' / 'Lead' / 'VP'
    const sortedNodes = [...deptNodes].sort((a, b) => {
      const aDepth = a.depth ?? 0;
      const bDepth = b.depth ?? 0;
      if (aDepth !== bDepth) return aDepth - bDepth;

      const priorityRegex = /(director|head|vp|vice president|chief|lead|manager)/i;
      const aPriority = priorityRegex.test(a.role || '') ? 1 : 0;
      const bPriority = priorityRegex.test(b.role || '') ? 1 : 0;
      return bPriority - aPriority;
    });

    const deptHead = sortedNodes[0];
    if (deptHead) {
      setRootNodeId(deptHead.id);
      setFocusedNodeId(deptHead.id);
      // Prune expanded state: expand up (manager) and down (team) for the dept head
      setExpandedState({
        [deptHead.id]: { up: true, down: true, left: false, right: false }
      });
      // Center camera on the department head node
      setTransform({ x: 0, y: 40, scale: 0.95 });
    }
  };

  const toggleExpand = (nodeId, direction) => {
    setExpandedState(prev => {
      const nodeState = prev[nodeId] || { up: false, down: false, left: false, right: false };
      return {
        ...prev,
        [nodeId]: {
          ...nodeState,
          [direction]: !nodeState[direction]
        }
      };
    });
    if (showHint) setShowHint(false);
  };

  // Canvas Mouse Pan
  const handleMouseDown = (e) => {
    if (e.target === containerRef.current || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const scaleChange = e.deltaY * -0.002;
      const newScale = Math.min(Math.max(0.3, transform.scale + scaleChange), 2.5);
      setTransform(prev => ({ ...prev, scale: newScale }));
    }
  };

  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.2) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(0.3, prev.scale - 0.2) }));
  
  // Center on "You", collapse distant branches to save CPU/DOM, and reset view
  const resetView = () => {
    const focusTarget = orgData['me'] ? 'me' : Object.keys(orgData)[0] || 'me';
    setRootNodeId(focusTarget);
    setFocusedNodeId(focusTarget);
    setActiveDepartment('All');
    // Collapse all branches and keep only focal node expanded to prevent any memory/CPU lag
    setExpandedState({
      [focusTarget]: { up: true, down: true, left: true, right: true }
    });
    setTransform({ x: 0, y: 40, scale: 0.95 });
  };

  // ── Admin Actions ──
  const openAddChild = (parent) => {
    setTargetNode(parent);
    setModalForm({ 
      title: '', 
      name: '', 
      role: '', 
      department: parent.department || '', 
      email: '' 
    });
    setModalError('');
    setActiveModal('add');
  };

  const openEdit = (node) => {
    setTargetNode(node);
    setModalForm({ 
      title: node.role || node.title || '', 
      name: node.name, 
      role: node.role || '', 
      department: node.department || '', 
      email: node.email || '' 
    });
    setModalError('');
    setActiveModal('edit');
  };

  const openDelete = (node) => {
    setTargetNode(node);
    setModalError('');
    setActiveModal('delete');
  };

  const openMobility = async (node) => {
    setMobilityEmployee(node);
    setActiveModal('mobility');
    setMobilityLoading(true);
    setMobilityHistory([]);
    try {
      const res = await api.get(`/org/hierarchy/mobility/${node.employeeId}`);
      setMobilityHistory(res.data?.data || []);
    } catch (err) {
      console.warn('Could not load mobility history:', err.message);
    } finally {
      setMobilityLoading(false);
    }
  };

  // Save Add Position
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const positionTitle = modalForm.role.trim() || modalForm.title.trim();
    if (!positionTitle) {
      setModalError('Position Title is required.');
      return;
    }

    setModalSaving(true);
    setModalError('');

    try {
      if (isLiveConnected) {
        // Backend API call: POST /api/admin/org-structure/positions
        const parentPosId = targetNode.backendPositionId || targetNode.id;
        await api.post('/admin/org-structure/positions', {
          title: positionTitle,
          parent_id: parentPosId
        });
        await fetchLiveHierarchy();
        triggerNotice(`Position "${positionTitle}" created successfully!`);
      } else {
        // Local Fallback simulation
        const newId = `node_${Date.now()}`;
        const newNode = {
          id: newId,
          name: modalForm.name.trim() || positionTitle,
          role: positionTitle,
          department: modalForm.department || targetNode.department || 'General',
          email: modalForm.email || `${positionTitle.toLowerCase().replace(/\s+/g, '.')}@haazri.com`,
          avatar: getAvatarForId(newId),
          connections: { up: [targetNode.id], down: [], left: [], right: [] }
        };

        setOrgData(prev => {
          const parent = prev[targetNode.id];
          const downReports = [...(parent.connections?.down || []), newId];
          return {
            ...prev,
            [newId]: newNode,
            [targetNode.id]: {
              ...parent,
              connections: { ...parent.connections, down: downReports }
            }
          };
        });

        setExpandedState(prev => ({
          ...prev,
          [targetNode.id]: { ...(prev[targetNode.id] || {}), down: true }
        }));
        triggerNotice(`Added "${positionTitle}" under ${targetNode.name}`);
      }

      setActiveModal(null);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create position.');
    } finally {
      setModalSaving(false);
    }
  };

  // Save Edit Position
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const updatedTitle = modalForm.role.trim() || modalForm.title.trim();
    if (!updatedTitle) {
      setModalError('Position title is required.');
      return;
    }

    setModalSaving(true);
    setModalError('');

    try {
      if (isLiveConnected) {
        const positionId = targetNode.backendPositionId || targetNode.id;
        await api.patch(`/admin/org-structure/positions/${positionId}`, {
          title: updatedTitle
        });
        await fetchLiveHierarchy();
        triggerNotice(`Position updated to "${updatedTitle}"`);
      } else {
        setOrgData(prev => ({
          ...prev,
          [targetNode.id]: {
            ...prev[targetNode.id],
            name: modalForm.name.trim() || updatedTitle,
            role: updatedTitle,
            department: modalForm.department,
            email: modalForm.email
          }
        }));
        triggerNotice(`Updated "${updatedTitle}"`);
      }

      setActiveModal(null);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update position.');
    } finally {
      setModalSaving(false);
    }
  };

  // Confirm Delete Position
  const handleConfirmDelete = async () => {
    setModalSaving(true);
    setModalError('');

    try {
      if (isLiveConnected) {
        const positionId = targetNode.backendPositionId || targetNode.id;
        await api.delete(`/admin/org-structure/positions/${positionId}`);
        await fetchLiveHierarchy();
        triggerNotice(`Position "${targetNode.role}" removed successfully`);
      } else {
        setOrgData(prev => {
          const updated = { ...prev };
          delete updated[targetNode.id];

          Object.keys(updated).forEach(k => {
            const node = updated[k];
            if (node.connections) {
              ['up', 'down', 'left', 'right'].forEach(dir => {
                if (node.connections[dir]) {
                  node.connections[dir] = node.connections[dir].filter(id => id !== targetNode.id);
                }
              });
            }
          });
          return updated;
        });
        triggerNotice(`Removed "${targetNode.name}"`);
      }

      setActiveModal(null);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to remove position.');
    } finally {
      setModalSaving(false);
    }
  };

  // Apply Starter Template
  const handleApplyTemplate = async () => {
    setModalSaving(true);
    setModalError('');
    try {
      await api.post('/admin/org-structure/templates/apply', {
        templateKey: selectedTemplateKey,
        replaceExisting: true
      });
      await fetchLiveHierarchy();
      triggerNotice(`Template applied successfully! Org tree generated.`);
      setActiveModal(null);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to apply template.');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <AppShell>
      <OrgContext.Provider value={{ 
        orgData, 
        expandedState, 
        toggleExpand, 
        openAddChild, 
        openEdit, 
        openDelete, 
        openMobility,
        canManage,
        focusedNodeId,
        activeDepartment
      }}>
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans text-slate-800 select-none relative">
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Feedback Toast Notification */}
          {feedbackNotice && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.2s_ease-out]">
              <div className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
                feedbackNotice.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {feedbackNotice.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle size={15} className="text-emerald-400" />}
                <span>{feedbackNotice.text}</span>
              </div>
            </div>
          )}

          {/* Dedicated Header & Controls Bar */}
          <div className="h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex-shrink-0">
            {/* Title & Badges */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Organization Map</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isLiveConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#1677B8] border-blue-200'
                  }`}>
                    {isLiveConnected ? 'Live Backend' : 'Demo Sandbox'}
                  </span>
                  {activeDepartment !== 'All' && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Dept: {activeDepartment}
                    </span>
                  )}
                  {canManage && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 hidden sm:block">
                  Radial interactive exploration • Click chevrons to navigate managers, peers, and team reports
                </p>
              </div>
            </div>

            {/* Top Bar Action Dock */}
            <div className="flex items-center gap-2">
              {/* Refresh Sync Button */}
              <button 
                onClick={fetchLiveHierarchy}
                title="Refresh Live Data"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-[#1677B8]' : ''} />
              </button>

              {/* Reset Focal View Button */}
              <button 
                onClick={resetView}
                title="Reset View to You"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold transition"
              >
                <Layers size={14} className="text-[#1677B8]" />
                <span>Center "You"</span>
              </button>

              {/* Department Filter Dropdown Button */}
              <div className="relative">
                <button 
                  onClick={() => { setDeptMenuOpen(!deptMenuOpen); setDirectoryOpen(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    activeDepartment !== 'All' 
                      ? 'border-indigo-300 text-indigo-700 bg-indigo-50' 
                      : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase size={14} className={activeDepartment !== 'All' ? 'text-indigo-600' : 'text-[#1677B8]'} />
                  <span>{activeDepartment === 'All' ? 'All Departments' : activeDepartment}</span>
                  <Filter size={11} className="text-slate-400 ml-0.5" />
                </button>

                {deptMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Filter by Department
                    </div>
                    {departments.map(dept => (
                      <button
                        key={dept}
                        onClick={() => selectDepartment(dept)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                          activeDepartment === dept ? 'bg-blue-50 text-[#1677B8] font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{dept}</span>
                        {activeDepartment === dept && <span className="w-1.5 h-1.5 bg-[#1677B8] rounded-full"></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* People Directory Toggle Button */}
              <button 
                onClick={() => { setDirectoryOpen(!directoryOpen); setDeptMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  directoryOpen 
                    ? 'border-[#1677B8] text-[#1677B8] bg-blue-50' 
                    : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Users size={14} className="text-[#1677B8]" />
                <span>People Directory</span>
              </button>

              {/* Starter Templates Button for Admin */}
              {canManage && (
                <button 
                  onClick={() => { setModalError(''); setActiveModal('templates'); }}
                  title="Apply Hierarchy Template"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                >
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>Templates</span>
                </button>
              )}

              {/* Quick Add Member Shortcut for Admin */}
              {canManage && (
                <button 
                  onClick={() => openAddChild(orgData[rootNodeId] || orgData['me'] || Object.values(orgData)[0])}
                  title="Add New Member"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1677B8] hover:bg-[#125d91] text-white rounded-lg shadow-sm text-xs font-semibold transition"
                >
                  <Plus size={14} />
                  <span>Add Member</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Interactive Canvas Area */}
          <div 
            ref={containerRef}
            className={`flex-1 relative overflow-hidden bg-slate-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
              backgroundPosition: `${transform.x}px ${transform.y}px`
            }}
          >
            {/* Slide-out People Directory Drawer */}
            {directoryOpen && (
              <div className="absolute top-6 right-8 w-80 max-h-[calc(100vh-160px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#1677B8]" />
                    <span className="font-bold text-slate-800 text-sm">People Directory</span>
                  </div>
                  <button onClick={() => setDirectoryOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                    <X size={16} />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <Search size={14} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search name, title, department..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="text-xs text-slate-800 placeholder-slate-400 outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Directory Results List */}
                <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
                  {directoryEmployees.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No members found matching "{searchQuery}"
                    </div>
                  ) : (
                    directoryEmployees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => focusOnEmployee(emp.id)}
                        className="w-full text-left p-2 rounded-xl hover:bg-blue-50/60 transition group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={emp.avatar} 
                            alt={emp.name} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677B8]">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {emp.role} · <span className="text-[#1677B8] font-medium">{emp.department}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-400 group-hover:text-[#1677B8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Canvas Zoom Controls */}
            <div className="absolute bottom-8 right-8 flex items-center space-x-1.5 z-40 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-slate-200">
              <button onClick={zoomOut} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition" title="Zoom Out">
                <Minimize size={18} />
              </button>
              <span className="text-[13px] font-semibold w-12 text-center text-slate-600 select-none">
                {Math.round(transform.scale * 100)}%
              </span>
              <button onClick={zoomIn} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition" title="Zoom In">
                <Maximize size={18} />
              </button>
              <div className="w-px h-5 bg-slate-300 mx-1"></div>
              <button onClick={resetView} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1677B8] rounded-lg text-[13px] font-semibold transition-colors">
                Reset
              </button>
            </div>

            {/* Transformable Interactive Canvas Layer */}
            <div 
              className="absolute top-1/2 left-1/2 origin-center transition-transform duration-75 ease-out"
              style={{ 
                transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale})` 
              }}
            >
              <div className="relative">
                {orgData[rootNodeId] ? (
                  <TreeNode nodeId={rootNodeId} />
                ) : (
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center max-w-sm">
                    <Building2 size={32} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-800 text-base">No Positions Found</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Your organization does not have an org structure populated yet.</p>
                    {canManage && (
                      <button 
                        onClick={() => setActiveModal('templates')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1677B8] rounded-lg"
                      >
                        Apply Starter Template
                      </button>
                    )}
                  </div>
                )}

                {/* Guidance tooltip on root */}
                {showHint && orgData[rootNodeId] && (
                  <div className="absolute top-full mt-10 left-1/2 transform -translate-x-1/2 w-72 animate-bounce pointer-events-none z-50">
                    <div className="bg-slate-800 text-white text-xs py-2.5 px-4 rounded-xl shadow-xl flex items-center">
                      <Info size={16} className="text-blue-400 mr-2 flex-shrink-0" />
                      <span>Click any chevron button to dynamically explore the org tree!</span>
                    </div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-slate-800"></div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Admin: Add Subordinate Position Modal ── */}
          {activeModal === 'add' && targetNode && (
            <AdminModal title={`Add Subordinate under ${targetNode.name}`} onClose={() => setActiveModal(null)}>
              <form onSubmit={handleSaveAdd} className="space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position Title / Role <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={modalForm.role} 
                    onChange={e => setModalForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Senior Software Engineer" 
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                  />
                </div>

                {!isLiveConnected && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Name</label>
                      <input 
                        type="text" 
                        value={modalForm.name} 
                        onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. John Doe" 
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                      <input 
                        type="text" 
                        value={modalForm.department} 
                        onChange={e => setModalForm(f => ({ ...f, department: e.target.value }))}
                        placeholder="e.g. Engineering" 
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={modalForm.email} 
                        onChange={e => setModalForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="john@haazri.com" 
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                  </>
                )}

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Reporting to: <strong>{targetNode.name}</strong> ({targetNode.role})
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={modalSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1677B8] hover:bg-[#125d91] rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {modalSaving ? 'Creating...' : 'Create Position'}
                  </button>
                </div>
              </form>
            </AdminModal>
          )}

          {/* ── Admin: Edit Position Modal ── */}
          {activeModal === 'edit' && targetNode && (
            <AdminModal title={`Edit Position: ${targetNode.role}`} onClose={() => setActiveModal(null)}>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={modalForm.role} 
                    onChange={e => setModalForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                  />
                </div>

                {!isLiveConnected && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={modalForm.name} 
                        onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                      <input 
                        type="text" 
                        value={modalForm.department} 
                        onChange={e => setModalForm(f => ({ ...f, department: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={modalForm.email} 
                        onChange={e => setModalForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1677B8]"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={modalSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1677B8] hover:bg-[#125d91] rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {modalSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </AdminModal>
          )}

          {/* ── Admin: Delete Position Modal ── */}
          {activeModal === 'delete' && targetNode && (
            <AdminModal title="Remove Position" onClose={() => setActiveModal(null)}>
              <div className="space-y-3">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {modalError}
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  Are you sure you want to remove <strong>{targetNode.role}</strong> from the organizational map?
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
                  ⚠️ Positions with active employee assignments must be reassigned before deletion.
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDelete} 
                    disabled={modalSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {modalSaving ? 'Removing...' : 'Yes, Remove'}
                  </button>
                </div>
              </div>
            </AdminModal>
          )}

          {/* ── Admin: Starter Templates Modal ── */}
          {activeModal === 'templates' && (
            <AdminModal title="Starter Hierarchy Templates" onClose={() => setActiveModal(null)} maxWidth="max-w-lg">
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Choose a pre-configured organizational hierarchy template for your company type.
                </p>

                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {modalError}
                  </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {[
                    { id: 'corporate', name: 'Corporate & Technology Enterprise', icon: '🏢', desc: 'Executive leadership (CEO/CTO/COO/CFO), Engineering, HR, Finance.' },
                    { id: 'startup', name: 'Startup / Agile Product Team', icon: '🚀', desc: 'Founder & CEO, Co-Founder CTO, Dev Leads, UX Designer, Growth.' },
                    { id: 'healthcare', name: 'Hospital / Healthcare Facility', icon: '🏥', desc: 'Chief Medical Officer, Emergency, Surgery, Chief Nursing Officer.' },
                    { id: 'school', name: 'School / College / University', icon: '🏫', desc: 'Principal/Dean, Vice Principals, Department Heads, Professors.' },
                    { id: 'retail', name: 'Retail Store Chain', icon: '🛍️', desc: 'Store GM, Assistant GM, Floor Supervisors, Cashier Leads, Inventory.' },
                    { id: 'ngo', name: 'NGO / Non-Profit Foundation', icon: '🤝', desc: 'Executive Director, Program Managers, Field Officers, Grants.' },
                  ].map(tpl => (
                    <label 
                      key={tpl.id} 
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedTemplateKey === tpl.id 
                          ? 'border-[#1677B8] bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="templateKey" 
                        checked={selectedTemplateKey === tpl.id}
                        onChange={() => setSelectedTemplateKey(tpl.id)}
                        className="mt-1 text-[#1677B8]"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{tpl.icon}</span>
                          <span>{tpl.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{tpl.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleApplyTemplate} 
                    disabled={modalSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1677B8] hover:bg-[#125d91] rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {modalSaving ? 'Applying...' : 'Apply Template'}
                  </button>
                </div>
              </div>
            </AdminModal>
          )}

          {/* ── Employee Mobility Audit Modal ── */}
          {activeModal === 'mobility' && mobilityEmployee && (
            <AdminModal 
              title={`Internal Movement History: ${mobilityEmployee.name}`} 
              onClose={() => setActiveModal(null)} 
              maxWidth="max-w-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1677B8] uppercase tracking-wider">
                    Mobility Audit Log
                  </span>
                  <span className="text-[11px] bg-blue-50 text-[#1677B8] px-2 py-0.5 rounded-full font-semibold">
                    {mobilityHistory.length} {mobilityHistory.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {mobilityLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Loading mobility audit records...
                  </div>
                ) : mobilityHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No organizational movements recorded for this employee yet.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {mobilityHistory.map((rec, i) => (
                      <div key={rec.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Action: <strong>{rec.action}</strong></span>
                          <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                        </div>
                        {rec.reason && (
                          <div className="text-slate-600 font-medium">Reason: {rec.reason}</div>
                        )}
                        <div className="text-slate-500 text-[11px]">
                          <div>Dept: <strong>{rec.old_data?.department_name || 'None'}</strong> → <strong>{rec.new_data?.department_name || 'None'}</strong></div>
                          <div>Manager: <strong>{rec.old_data?.manager_name || 'None'}</strong> → <strong>{rec.new_data?.manager_name || 'None'}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </AdminModal>
          )}

        </div>
      </OrgContext.Provider>
    </AppShell>
  );
}
