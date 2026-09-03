'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Clock,
  FileText,
  Phone,
  Sparkles,
  Info,
  Check,
  Lock,
} from 'lucide-react';
import { PortalAccessRole, EmployeePermissions } from '../../types';
import {
  STAFF_PRESET_PERMISSIONS,
  HR_ADMIN_PRESET_PERMISSIONS,
  MANAGER_PRESET_PERMISSIONS,
} from '../../lib/permissionUtils';

interface RolePermissionManagerProps {
  portalAccess: PortalAccessRole;
  permissions?: EmployeePermissions;
  onChange: (portalAccess: PortalAccessRole, permissions: EmployeePermissions) => void;
  disabled?: boolean;
}

export const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  portalAccess,
  permissions,
  onChange,
  disabled = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<PortalAccessRole>(portalAccess || 'NONE');
  const [perms, setPerms] = useState<EmployeePermissions>(permissions || STAFF_PRESET_PERMISSIONS);

  useEffect(() => {
    setSelectedRole(portalAccess || 'NONE');
  }, [portalAccess]);

  useEffect(() => {
    if (permissions) {
      setPerms(permissions);
    }
  }, [permissions]);

  const handleRoleSelect = (role: PortalAccessRole) => {
    if (disabled) return;
    setSelectedRole(role);

    let nextPerms: EmployeePermissions;
    if (role === 'NONE') {
      nextPerms = { ...STAFF_PRESET_PERMISSIONS };
    } else if (role === 'HR_ADMIN') {
      nextPerms = { ...HR_ADMIN_PRESET_PERMISSIONS };
    } else if (role === 'MANAGER') {
      nextPerms = { ...MANAGER_PRESET_PERMISSIONS };
    } else {
      // CUSTOM preserves existing or defaults to Manager preset
      nextPerms = { ...(perms || MANAGER_PRESET_PERMISSIONS) };
    }

    setPerms(nextPerms);
    onChange(role, nextPerms);
  };

  const handleTogglePermission = (key: keyof EmployeePermissions) => {
    if (disabled || selectedRole === 'NONE') return;

    const nextPerms = {
      ...perms,
      [key]: !perms[key],
    };

    // If toggling a preset and it differs from the preset template, switch role to CUSTOM
    let nextRole = selectedRole;
    if (selectedRole === 'HR_ADMIN') {
      const matchesHR =
        nextPerms.can_manual_punch === HR_ADMIN_PRESET_PERMISSIONS.can_manual_punch &&
        nextPerms.can_manage_staff === HR_ADMIN_PRESET_PERMISSIONS.can_manage_staff &&
        nextPerms.can_approve_leaves === HR_ADMIN_PRESET_PERMISSIONS.can_approve_leaves &&
        nextPerms.can_view_phone === HR_ADMIN_PRESET_PERMISSIONS.can_view_phone;
      if (!matchesHR) nextRole = 'CUSTOM';
    } else if (selectedRole === 'MANAGER') {
      const matchesMgr =
        nextPerms.can_manual_punch === MANAGER_PRESET_PERMISSIONS.can_manual_punch &&
        nextPerms.can_manage_staff === MANAGER_PRESET_PERMISSIONS.can_manage_staff &&
        nextPerms.can_approve_leaves === MANAGER_PRESET_PERMISSIONS.can_approve_leaves &&
        nextPerms.can_view_phone === MANAGER_PRESET_PERMISSIONS.can_view_phone;
      if (!matchesMgr) nextRole = 'CUSTOM';
    }

    setSelectedRole(nextRole);
    setPerms(nextPerms);
    onChange(nextRole, nextPerms);
  };

  const permissionCards = [
    {
      key: 'can_manual_punch' as keyof EmployeePermissions,
      title: 'Manual Clock-In / Out',
      description: 'Can mark daily live punch for workers and employees without smartphones.',
      icon: Clock,
    },
    {
      key: 'can_manage_staff' as keyof EmployeePermissions,
      title: 'Staff Management',
      description: 'Can onboard new staff, update employee profile details, and change shifts.',
      icon: Users,
    },
    {
      key: 'can_approve_leaves' as keyof EmployeePermissions,
      title: 'Approve Leave Requests',
      description: 'Can review pending leaves and approve or reject employee leave requests.',
      icon: FileText,
    },
    {
      key: 'can_view_phone' as keyof EmployeePermissions,
      title: 'View Contact Numbers',
      description: 'Can access confidential phone numbers of staff members.',
      icon: Phone,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Role Selection Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Admin Portal Access Role
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Option 1: Standard Staff */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleRoleSelect('NONE')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedRole === 'NONE'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold ${selectedRole === 'NONE' ? 'text-white' : 'text-slate-800'}`}>
                Standard Staff
              </span>
              {selectedRole === 'NONE' && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-tight ${selectedRole === 'NONE' ? 'text-slate-300' : 'text-slate-500'}`}>
              Mobile app only. No dashboard access.
            </p>
          </button>

          {/* Option 2: HR Admin */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleRoleSelect('HR_ADMIN')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedRole === 'HR_ADMIN'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold ${selectedRole === 'HR_ADMIN' ? 'text-white' : 'text-slate-800'}`}>
                HR Admin
              </span>
              {selectedRole === 'HR_ADMIN' && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-tight ${selectedRole === 'HR_ADMIN' ? 'text-indigo-200' : 'text-slate-500'}`}>
              Punch, Manage Staff, Leaves & Phone.
            </p>
          </button>

          {/* Option 3: Manager */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleRoleSelect('MANAGER')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedRole === 'MANAGER'
                ? 'bg-amber-900 text-white border-amber-900 shadow-md ring-2 ring-amber-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold ${selectedRole === 'MANAGER' ? 'text-white' : 'text-slate-800'}`}>
                Manager
              </span>
              {selectedRole === 'MANAGER' && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-tight ${selectedRole === 'MANAGER' ? 'text-amber-200' : 'text-slate-500'}`}>
              Punch & Leaves. No staff modification.
            </p>
          </button>

          {/* Option 4: Custom */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleRoleSelect('CUSTOM')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedRole === 'CUSTOM'
                ? 'bg-teal-900 text-white border-teal-900 shadow-md ring-2 ring-teal-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold ${selectedRole === 'CUSTOM' ? 'text-white' : 'text-slate-800'}`}>
                Custom
              </span>
              {selectedRole === 'CUSTOM' && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-tight ${selectedRole === 'CUSTOM' ? 'text-teal-200' : 'text-slate-500'}`}>
              Customize each permission individually.
            </p>
          </button>
        </div>
      </div>

      {/* Granular Permission Toggles */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Granular Permissions {selectedRole === 'NONE' ? '(Disabled for Standard Staff)' : ''}
          </label>
          {selectedRole !== 'NONE' && (
            <span className="text-[11px] text-slate-500 font-medium">
              Click any permission below to toggle
            </span>
          )}
        </div>

        {selectedRole === 'NONE' ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0" />
            <span>
              This employee is currently configured as <strong>Standard Staff</strong>. They will only use the Hazree Employee Mobile App to view their shift and mark their own attendance.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {permissionCards.map((card) => {
              const isEnabled = Boolean(perms && perms[card.key]);
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  onClick={() => handleTogglePermission(card.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs hover:bg-emerald-50'
                      : 'bg-white border-slate-200 hover:bg-slate-50 opacity-75'
                  } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {card.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                        isEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
