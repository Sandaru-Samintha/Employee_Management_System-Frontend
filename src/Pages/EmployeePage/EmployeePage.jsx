import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import {
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineIdentification,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlinePencilAlt,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineX
} from 'react-icons/hi';
import { WiStars } from 'react-icons/wi';
import { useNavigate } from 'react-router-dom';

function EmployeePage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    role: '',
    status: 'Active',
    phoneNumber: '',
  });
  const [phoneError, setPhoneError] = useState('');

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || '';
  const isAdmin = userRole.toLowerCase() === 'admin';
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchEmployees();
    // Get user info from localStorage (stored during login)
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (firstName || lastName || userRole) {
      setUserInfo({
        firstName: firstName || '',
        lastName: lastName || '',
        role: userRole || '',
        email: userEmail || ''
      });
    }
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const inactiveEmployees = employees.filter(emp => emp.status !== 'Active').length;

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/employees/getemployees', {
        headers: authHeaders,
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    if (!isAdmin) {
      toast.error('Only admins can add employees');
      return;
    }
    setEditingId(null);
    setForm({ employeeId: '', name: '', email: '', role: '', status: 'Active', phoneNumber: '' });
    setPhoneError('');
    setShowForm(true);
  }

  function openEdit(emp) {
    if (!isAdmin) {
      toast.error('Only admins can edit employees');
      return;
    }
    setEditingId(emp.employeeId || emp._id || null);
    setForm({
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || '',
      status: emp.status || 'Active',
      phoneNumber: emp.phoneNumber || '',
    });
    setPhoneError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admins can save employee changes');
      return;
    }
    // Validate phone before submitting
    if (form.phoneNumber && !validatePhone(form.phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    // Check duplicate phone numbers (normalize digits); allow same number for the employee being edited
    if (form.phoneNumber) {
      const normalized = (form.phoneNumber || '').replace(/\D/g, '');
      const duplicate = employees.some(emp => {
        const empDigits = (emp.phoneNumber || '').replace(/\D/g, '');
        const id = emp.employeeId || emp._id || '';
        return empDigits === normalized && id !== (editingId || '');
      });
      if (duplicate) {
        toast.error('Phone number already in use');
        return;
      }
    }
    try {
      if (editingId) {
        await axios.put(
          import.meta.env.VITE_API_URL + '/employees/updateemployee/' + editingId,
          { ...form, phoneNumber: form.phoneNumber ? formatPhoneForSave(form.phoneNumber) : '' },
          { headers: authHeaders }
        );
        toast.success('Employee updated');
      } else {
        await axios.post(
          import.meta.env.VITE_API_URL + '/employees/saveemployee',
          { ...form, phoneNumber: form.phoneNumber ? formatPhoneForSave(form.phoneNumber) : '' },
          { headers: authHeaders }
        );
        toast.success('Employee added');
      }
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  }

  // Simple phone validation: allow digits, spaces, parentheses, dashes and optional leading +
  function validatePhone(phone) {
    if (!phone) return true; // optional field
    // Reject letters outright
    if (/[A-Za-z]/.test(phone)) return false;
    const digits = phone.replace(/\D/g, '');
    // Accept Sri Lanka formats:
    // - local: 10 digits starting with '07' (e.g., 071xxxxxxx)
    // - international: 11 digits starting with '94' (e.g., +9471xxxxxxx -> digits '9471...')
    // - short local without leading 0: 9 digits starting with '7' (e.g., 771234567)
    if (digits.length === 10 && digits.startsWith('07')) return true;
    if (digits.length === 11 && digits.startsWith('94')) return true;
    if (digits.length === 9 && digits.startsWith('7')) return true;
    return false;
  }

  // Format phone for saving: convert to international +94 format
  function formatPhoneForSave(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('07')) {
      // local -> remove leading 0 and prefix +94
      return '+94' + digits.slice(1);
    }
    if (digits.length === 11 && digits.startsWith('94')) {
      return '+' + digits;
    }
    if (digits.length === 9 && digits.startsWith('7')) {
      return '+94' + digits;
    }
    // Fallback: return digits prefixed with + if seems international
    return '+' + digits;
  }

  // Helper: normalize phone to digits-only string
  function normalizePhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  async function handleDelete(id) {
    if (!isAdmin) {
      toast.error('Only admins can delete employees');
      return;
    }
    if (!confirm('Delete this employee?')) return;
    try {
      await axios.delete(import.meta.env.VITE_API_URL + '/employees/deleteemployee/' + id, {
        headers: authHeaders,
      });
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete employee');
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    toast.success('Logged out successfully');
    navigate('/');
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm';
      case 'Inactive':
        return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm';
      default:
        return 'bg-gray-500/70 text-white';
    }
  };

  // Get full name from userInfo
  const getFullName = () => {
    if (userInfo) {
      const firstName = userInfo.firstName || '';
      const lastName = userInfo.lastName || '';
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }
    return 'User';
  };

  const getUserRole = () => {
    return userInfo?.role || 'Employee';
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesName = emp.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0385] to-[#E064F9] p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <HiOutlineUserCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <WiStars className="text-yellow-300 text-3xl" />
                  <p className="text-white/80 text-sm uppercase tracking-wide">Welcome back,</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
                  {getFullName()} 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300"> ({getUserRole()})</span>
                </h2>
                <p className="text-white/60 text-sm mt-1">Manage your team and employees efficiently</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openAdd}
                disabled={!isAdmin}
                className={`px-5 py-2.5 rounded-full text-white font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${isAdmin ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105' : 'bg-white/10 text-gray-300 cursor-not-allowed opacity-70'}`}
              >
                <HiOutlineUserAdd className="text-xl" />
                Add Employee
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <HiOutlineLogout className="text-xl" />
                Logout
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/70">
            {isAdmin ? (
              <span className="inline-flex items-center gap-2">Admin access enabled — you can add, edit, and delete employees.</span>
            ) : (
              <span className="inline-flex items-center gap-2">Read-only access — only admins can add, edit, or delete employees.</span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm uppercase tracking-wider font-medium">Total Employees</p>
                <p className="text-4xl font-black text-white mt-2">{totalEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <HiOutlineUserGroup className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm uppercase tracking-wider font-medium">Active</p>
                <p className="text-4xl font-black text-white mt-2">{activeEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <FaUserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-200 text-sm uppercase tracking-wider font-medium">Inactive</p>
                <p className="text-4xl font-black text-white mt-2">{inactiveEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                <FaUserTimes className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-400"></div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="employee-search">Search employees</label>
                  <div className="relative flex-1">
                    <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                    <input
                      id="employee-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full rounded-2xl bg-slate-900/90 border border-white/10 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                  </div>
                  <div className="min-w-[160px]">
                    <label className="sr-only" htmlFor="status-filter">Filter by status</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full rounded-2xl bg-slate-900/90 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-white/70">
                  Showing {currentEmployees.length} of {filteredEmployees.length} matching employees
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-800/80 to-slate-900/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-300 italic">
                        {searchQuery || statusFilter !== 'All' ? 'No matching employees found' : 'No employees found'}
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((emp) => (
                      <tr key={emp.employeeId || emp._id} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-fuchsia-200">
                          <div className="flex items-center gap-2">
                            <HiOutlineIdentification className="text-fuchsia-300" />
                            {emp.employeeId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{emp.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          <div className="flex items-center gap-2">
                            <HiOutlineMail className="text-indigo-300" />
                            {emp.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1 w-fit">
                            <HiOutlineBriefcase className="text-fuchsia-300" />
                            {emp.role || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(emp.status)}`}>
                            {emp.status === 'Active' ? <HiOutlineCheck className="inline mr-1" /> : <HiOutlineX className="inline mr-1" />}
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          <div className="flex items-center gap-2">
                            <HiOutlinePhone className="text-emerald-300" />
                            {emp.phoneNumber || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isAdmin ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(emp)}
                                className="px-3 py-1.5 rounded-full bg-indigo-500/80 hover:bg-indigo-500 text-white text-xs font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-1"
                              >
                                <HiOutlinePencilAlt className="text-sm" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(emp.employeeId)}
                                className="px-3 py-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-1"
                              >
                                <HiOutlineTrash className="text-sm" />
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic">Admin only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-white/10 bg-slate-950/20 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-white/70">
                Page {currentPage} of {totalPages}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full px-3 py-2 bg-slate-900/90 border border-white/10 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`rounded-full px-3 py-2 text-sm transition ${page === currentPage ? 'bg-fuchsia-500 text-white' : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full px-3 py-2 bg-slate-900/90 border border-white/10 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-white/20 transform transition-all scale-100">
              <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent mb-5 flex items-center gap-2">
                  {editingId ? (
                    <>
                      <HiOutlinePencilAlt className="text-fuchsia-300" />
                      Edit Employee
                    </>
                  ) : (
                    <>
                      <HiOutlineUserAdd className="text-fuchsia-300" />
                      Add New Employee
                    </>
                  )}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="flex text-sm font-medium text-gray-300 mb-1 items-center gap-1">
                      <HiOutlineIdentification className="text-indigo-300" />
                      Employee ID
                    </label>
                    <input
                      required
                      value={form.employeeId}
                      onChange={e => setForm({ ...form, employeeId: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter employee ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="flex text-sm font-medium text-gray-300 mb-1 items-center gap-1">
                      <HiOutlineMail className="text-indigo-300" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="flex text-sm font-medium text-gray-300 mb-1 items-center gap-1">
                      <HiOutlineBriefcase className="text-indigo-300" />
                      Role
                    </label>
                    <input
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter role (e.g., Developer, Manager)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
                    >
                      <option className="bg-slate-800">Active</option>
                      <option className="bg-slate-800">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex text-sm font-medium text-gray-300 mb-1 items-center gap-1">
                      <HiOutlinePhone className="text-indigo-300" />
                      Phone Number
                    </label>
                    <input
                      value={form.phoneNumber}
                      onChange={e => {
                        const val = e.target.value;
                        setForm({ ...form, phoneNumber: val });
                        // validation
                        if (val && !validatePhone(val)) {
                          setPhoneError('Invalid phone number');
                          return;
                        }
                        // duplicate check against current employees (allow same for editing)
                        const normalized = normalizePhone(val);
                        const duplicate = employees.some(emp => {
                          const empDigits = normalizePhone(emp.phoneNumber);
                          const id = emp.employeeId || emp._id || '';
                          return normalized && empDigits === normalized && id !== (editingId || '');
                        });
                        if (duplicate) setPhoneError('Phone number already in use');
                        else setPhoneError('');
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
                    {phoneError && (
                      <p className="text-rose-400 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 font-semibold transition-all flex items-center gap-1"
                    >
                      <HiOutlineX className="text-lg" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!!phoneError}
                      className={`px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1 ${phoneError ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {editingId ? (
                        <>
                          <HiOutlinePencilAlt />
                          Update
                        </>
                      ) : (
                        <>
                          <HiOutlineUserAdd />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeePage;