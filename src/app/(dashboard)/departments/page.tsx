'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Trash2,
  Building2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Globe,
  Briefcase,
  Shield,
  Pencil,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  fetchDepartmentsAsync,
  createDepartmentAsync,
  updateDepartmentAsync,
  deleteDepartmentAsync,
  clearDepartmentError,
  clearDepartmentSuccess,
} from '../../../redux/slices/departmentsSlice';
import { fetchCompaniesAsync } from '../../../redux/slices/companiesSlice';
import { BackendDepartment } from '../../../services/departmentsService';

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { departments, isLoading, isCreating, isUpdating, error, successMessage } = useAppSelector(
    (state) => state.departments
  );
  const companies = useAppSelector((state) => state.companies.companies);

  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptScope, setDeptScope] = useState<'GLOBAL' | string>('GLOBAL');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<BackendDepartment | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptDesc, setEditDeptDesc] = useState('');
  const [editDeptScope, setEditDeptScope] = useState<'GLOBAL' | string>('GLOBAL');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<BackendDepartment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartmentsAsync());
    dispatch(fetchCompaniesAsync());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDepartmentsAsync());
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    const companyId = deptScope === 'GLOBAL' ? undefined : Number(deptScope);

    const action = await dispatch(
      createDepartmentAsync({
        name: deptName.trim(),
        description: deptDesc.trim() || undefined,
        company_id: companyId,
      })
    );

    if (createDepartmentAsync.fulfilled.match(action)) {
      setDeptName('');
      setDeptDesc('');
      setDeptScope('GLOBAL');
      setIsAddModalOpen(false);
      dispatch(fetchDepartmentsAsync());
    }
  };

  const handleOpenEdit = (dept: BackendDepartment) => {
    setEditingDept(dept);
    setEditDeptName(dept.name);
    setEditDeptDesc(dept.description || '');
    setEditDeptScope(dept.company_id ? String(dept.company_id) : 'GLOBAL');
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editDeptName.trim()) return;

    const companyId = editDeptScope === 'GLOBAL' ? 0 : Number(editDeptScope);

    const action = await dispatch(
      updateDepartmentAsync({
        id: editingDept.id,
        data: {
          name: editDeptName.trim(),
          description: editDeptDesc.trim() || '',
          company_id: companyId,
        },
      })
    );

    if (updateDepartmentAsync.fulfilled.match(action)) {
      setIsEditModalOpen(false);
      setEditingDept(null);
      dispatch(fetchDepartmentsAsync());
    }
  };

  const handleOpenDelete = (dept: BackendDepartment) => {
    setDeptToDelete(dept);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteDepartmentAsync(deptToDelete.id));
      setIsDeleteModalOpen(false);
      setDeptToDelete(null);
      dispatch(fetchDepartmentsAsync());
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.company_name && d.company_name.toLowerCase().includes(q));

    const matchesScope =
      scopeFilter === 'ALL'
        ? true
        : scopeFilter === 'GLOBAL'
        ? !d.company_id
        : scopeFilter === 'COMPANY'
        ? !!d.company_id
        : true;

    return matchesSearch && matchesScope;
  });

  const globalCount = departments.filter((d) => !d.company_id).length;
  const companyCount = departments.filter((d) => !!d.company_id).length;

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Success / Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearDepartmentSuccess())}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearDepartmentError())}
            className="text-xs font-bold text-rose-700 hover:text-rose-950 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Department Master Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin Master Console • Configure global standard departments that appear across all organizations and Company Admin dropdowns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Department
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-base shrink-0">
            {departments.length}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Departments</span>
            <p className="text-sm font-extrabold text-slate-800">Master Directory</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base shrink-0">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Global Standard</span>
            <p className="text-sm font-extrabold text-slate-800">{globalCount} Universal Depts</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-base shrink-0">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organization Scoped</span>
            <p className="text-sm font-extrabold text-slate-800">{companyCount} Client Specific</p>
          </div>
        </div>
      </div>

      {/* Add New Department Modal Popup */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Department"
        subtitle="Instantly syncs to master directory"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cybersecurity & InfoSec, Legal..."
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Availability Scope <span className="text-rose-500">*</span>
            </label>
            <select
              value={deptScope}
              onChange={(e) => setDeptScope(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
            >
              <option value="GLOBAL">🌐 Global Standard (All Companies)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id.replace('cmp_', '')}>
                  🏢 {c.name} (Only this Company)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Core software engineering and infra team"
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!deptName.trim() || isCreating}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isCreating ? 'Saving...' : 'Save Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal Popup */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDept(null);
        }}
        title="Edit Department"
        subtitle={`Update "${editingDept?.name || 'Department'}"`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateDepartment} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cybersecurity & InfoSec..."
              value={editDeptName}
              onChange={(e) => setEditDeptName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Availability Scope <span className="text-rose-500">*</span>
            </label>
            <select
              value={editDeptScope}
              onChange={(e) => setEditDeptScope(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
            >
              <option value="GLOBAL">🌐 Global Standard (All Companies)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id.replace('cmp_', '')}>
                  🏢 {c.name} (Only this Company)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Core software engineering and infra team"
              value={editDeptDesc}
              onChange={(e) => setEditDeptDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDept(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!editDeptName.trim() || isUpdating}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeptToDelete(null);
        }}
        title="Delete Department"
        subtitle="Confirm department removal"
        maxWidth="sm"
      >
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Department</span>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{deptToDelete?.name}</h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-slate-900">"{deptToDelete?.name}"</span>? It will no longer appear in company dropdowns.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeptToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Search & Scope Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by title, scope, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Scopes ({departments.length})</option>
            <option value="GLOBAL">Global Standard ({globalCount})</option>
            <option value="COMPANY">Company Scoped ({companyCount})</option>
          </select>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredDepartments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-700">No Departments Found</p>
            <p className="text-xs text-slate-400">
              {departments.length === 0
                ? 'Click "Add New Department" to create your first standard department.'
                : 'No departments match your active search query.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4">Availability Scope</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200/60">
                          {dept.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{dept.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{dept.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Scope */}
                    <td className="py-3.5 px-4">
                      {!dept.company_id ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] border border-blue-200">
                          <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                          Global Standard
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[11px] border border-purple-200">
                          <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                          {dept.company_name || `Company #${dept.company_id}`}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {dept.description || 'Standard organization department'}
                    </td>

                    {/* Created By */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                        {dept.created_by_role || 'SUPER_ADMIN'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          title="Edit Department"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(dept)}
                          title="Delete Department"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
