import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUserGroup, 
  HiOutlineUserAdd, 
  HiOutlineUserRemove,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineBriefcase,
  HiOutlineIdentification,
  HiOutlineLogout,
  HiOutlineUserCircle
} from 'react-icons/hi';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { MdPeopleAlt } from 'react-icons/md';
import { WiStars } from 'react-icons/wi';

function EmployeePage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    role: '',
    status: 'Active',
    phoneNumber: '',
  });

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchEmployees();
    // Get user info from localStorage (stored during login)
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const userRole = localStorage.getItem('userRole');
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
    setEditingId(null);
    setForm({ employeeId: '', name: '', email: '', role: '', status: 'Active', phoneNumber: '' });
    setShowForm(true);
  }

  function openEdit(emp) {
    setEditingId(emp.employeeId);
    setForm({
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || '',
      status: emp.status || 'Active',
      phoneNumber: emp.phoneNumber || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          import.meta.env.VITE_API_URL + '/employees/updateemployee/' + editingId,
          form,
          { headers: authHeaders }
        );
        toast.success('Employee updated');
      } else {
        await axios.post(
          import.meta.env.VITE_API_URL + '/employees/saveemployee',
          form,
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

  async function handleDelete(id) {
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
            <div className="flex gap-3">
              <button
                onClick={openAdd}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-300 italic">No employees found</td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
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
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
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
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
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
                    <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                      <HiOutlinePhone className="text-indigo-300" />
                      Phone Number
                    </label>
                    <input
                      value={form.phoneNumber}
                      onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
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
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1"
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