'use client';

import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Users, UserPlus, Mail, Phone, Search, Building } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { addEmployee } from '../../../redux/slices/employeesSlice';
import { Employee } from '../../../types';

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state) => state.employees.employees);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [companyName, setCompanyName] = useState('Tata Tech Solutions');

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      companyId: 'cmp_101',
      companyName: companyName,
      name: name,
      email: email,
      phone: phone || '+91 98000 00000',
      role: role || 'Staff Member',
      department: department,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100&auto=format&fit=crop&q=80`,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    dispatch(addEmployee(newEmp));
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setRole('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Employee Directory</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff profiles, department assignments, and authentication credentials
          </p>
        </div>

        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by employee name, email, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} glass className="border border-slate-200/80">
            <div className="flex items-start gap-4">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 truncate">{emp.name}</h4>
                  <Badge variant={emp.status === 'Active' ? 'active' : 'pending'}>{emp.status}</Badge>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">{emp.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">{emp.department}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.companyName}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Onboard staff member to Hazree workforce system"
      >
        <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Priyanshu Jain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="p.jain@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Job Designation / Role"
              placeholder="Senior Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Design & UI">Design & UI</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <Input
              label="Company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

