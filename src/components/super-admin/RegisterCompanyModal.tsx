'use client';

import React, { useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, Layers, Users, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Company, PlanType } from '../../types';

interface RegisterCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newCompany: Company) => void;
}

export const RegisterCompanyModal: React.FC<RegisterCompanyModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: `HAZ-${Math.floor(1000 + Math.random() * 9000)}`,
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    location: '',
    plan: 'Growth' as PlanType,
    maxEmployees: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newCompany: Company = {
        id: `cmp_${Date.now()}`,
        name: formData.name,
        code: formData.code,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        plan: formData.plan,
        status: 'Active',
        employeeCount: 1, // Primary admin count
        maxEmployees: Number(formData.maxEmployees),
        createdAt: new Date().toISOString().split('T')[0],
        location: formData.location || 'Mumbai, MH',
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onRegisterSuccess(newCompany);
        setIsSuccess(false);
        onClose();
        // Reset form
        setFormData({
          name: '',
          code: `HAZ-${Math.floor(1000 + Math.random() * 9000)}`,
          adminName: '',
          adminEmail: '',
          adminPhone: '',
          location: '',
          plan: 'Growth',
          maxEmployees: 100,
        });
      }, 1000);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Company"
      subtitle="Onboard a new organization to the Hazree Attendance Platform"
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Company Registered Successfully!</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Credentials and onboarding instructions have been sent to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{formData.adminEmail}</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="e.g. Tata Tech Solutions"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              required
            />
            <Input
              label="Company Code / ID"
              placeholder="HAZ-1001"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              icon={<Layers className="w-4 h-4" />}
              required
            />
          </div>

          {/* Primary Admin Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Admin Name"
              placeholder="Rajesh Sharma"
              value={formData.adminName}
              onChange={(e) => handleChange('adminName', e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@company.com"
              value={formData.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={formData.adminPhone}
              onChange={(e) => handleChange('adminPhone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
            />
            <Input
              label="HQ Location"
              placeholder="Mumbai, MH"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          {/* Subscription & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Subscription Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => handleChange('plan', e.target.value as PlanType)}
                className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Trial">Free Trial (30 Days)</option>
                <option value="Growth">Growth Plan (Up to 150 Employees)</option>
                <option value="Enterprise">Enterprise Plan (Unlimited)</option>
              </select>
            </div>

            <Input
              label="Max Employee Limit"
              type="number"
              value={formData.maxEmployees}
              onChange={(e) => handleChange('maxEmployees', e.target.value)}
              icon={<Users className="w-4 h-4" />}
              required
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Company
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
