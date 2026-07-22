import React, { useState, useEffect, useContext } from 'react';
import { Shield, Trash, User, Search, Filter, Edit2, Eye, X, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (conf) => {
  if (conf >= 95) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (conf >= 90) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- User Directory State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const USER_PER_PAGE = 10;
  const [userPage, setUserPage] = useState(1);

  // --- Modals State ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  // --- User Derived State ---
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USER_PER_PAGE));
  
  // Ensure userPage is valid when filters change
  useEffect(() => {
    if (userPage > userTotalPages) {
      setUserPage(1);
    }
  }, [filteredUsers.length, userPage, userTotalPages]);

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USER_PER_PAGE,
    userPage * USER_PER_PAGE
  );

  const goToUserPage = (page) => {
    if (page >= 1 && page <= userTotalPages) setUserPage(page);
  };

  const getUserPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, userPage - 2);
    let end = Math.min(userTotalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // --- Pagination (Global Detection History) ---
  const HIST_PER_PAGE = 10;
  const [histPage, setHistPage] = useState(1);

  const histTotalPages = Math.max(1, Math.ceil(historyData.length / HIST_PER_PAGE));
  const paginatedHistory = historyData.slice(
    (histPage - 1) * HIST_PER_PAGE,
    histPage * HIST_PER_PAGE
  );

  const goToHistPage = (page) => {
    if (page >= 1 && page <= histTotalPages) setHistPage(page);
  };

  const getHistPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, histPage - 2);
    let end = Math.min(histTotalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  // -----------------------------------------------

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    } else if (token) {
      loadUsers();
      loadHistory();
    }
  }, [token, user, navigate]);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const openDeleteModal = (row) => {
    setUserToDelete(row);
    setDeleteModalOpen(true);
  };

  const openViewModal = (row) => {
    setUserToView(row);
    setViewModalOpen(true);
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900 dark:text-white">
          <Shield className="text-indigo-400" size={32} />
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage registered users and system access.</p>
      </div>

      <GlassCard tilt={false} className="!p-0 overflow-hidden">
        {/* Toolbar: Title, Search, Filter */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">User Directory</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Users: {filteredUsers.length}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search username..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#0a1321]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative w-full sm:w-auto min-w-[140px] group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Filter size={16} />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#0a1321]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table & Cards */}
        <div className="min-h-[300px]">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Total Scans</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {paginatedUsers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/row">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      #{row.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className={row.role === 'admin' ? "text-indigo-400" : "text-green-400"} />
                        <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${row.role === 'admin' ? 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                        {row.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {row.scans_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => openViewModal(row)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors opacity-0 group-hover/row:opacity-100 focus:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="View User"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(row)}
                          disabled={row.id === user.id}
                          className={`p-2 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100 focus:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center ${row.id === user.id ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                          title={row.id === user.id ? "Cannot delete yourself" : "Delete User"}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">No users found</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or role filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50 dark:bg-black/10">
            {paginatedUsers.map((row) => (
              <div key={row.id} className="bg-white dark:bg-[#0a1321]/80 backdrop-blur-sm p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <User size={20} className={row.role === 'admin' ? "text-indigo-400" : "text-green-400"} />
                    <div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">{row.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: #{row.id}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${row.role === 'admin' ? 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                    {row.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Scans:</span>
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                    {row.scans_count}
                  </span>
                </div>
                
                <div className="mt-2 flex justify-end gap-2">
                  <button 
                    onClick={() => openViewModal(row)}
                    className="flex-1 p-2 rounded-xl text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium min-h-[44px]"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button 
                    onClick={() => openDeleteModal(row)}
                    disabled={row.id === user.id}
                    className={`flex-1 p-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium min-h-[44px] ${row.id === user.id ? 'text-gray-400 bg-gray-100 dark:bg-white/5 cursor-not-allowed' : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20'}`}
                  >
                    <Trash size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {paginatedUsers.length === 0 && (
              <div className="text-center py-12 px-4 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                <Search className="mx-auto mb-3 text-gray-400" size={24} />
                <p className="font-medium mb-1">No users found</p>
                <p className="text-sm">Try adjusting your search or role filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* User Pagination Controls */}
        {userTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{userPage}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{userTotalPages}</span>
              <span className="ml-2 text-gray-500">
                ({(userPage - 1) * USER_PER_PAGE + 1}–
                {Math.min(userPage * USER_PER_PAGE, filteredUsers.length)} of {filteredUsers.length})
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToUserPage(userPage - 1)}
                disabled={userPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ‹ Prev
              </button>

              {getUserPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToUserPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    page === userPage
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-400/20 text-indigo-500 dark:text-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.3)]'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToUserPage(userPage + 1)}
                disabled={userPage === userTotalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard tilt={false} className="!p-0 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Global Detection History</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Scans: {historyData.length}
          </div>
        </div>

        {/* Responsive Table & Cards */}
        <div className="min-h-[300px]">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Waste Type</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Disposal Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {paginatedHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                        <User size={14} />
                        <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{row.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(row.conf)}`}>
                        {row.conf}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{row.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{row.method}</td>
                  </tr>
                ))}
                {paginatedHistory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No detection history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50 dark:bg-black/10">
            {paginatedHistory.map((row) => (
              <div key={row.id} className="bg-white dark:bg-[#0a1321]/80 backdrop-blur-sm p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{row.date} • {row.time}</div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{row.type}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(row.conf)}`}>
                    {row.conf}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg w-fit">
                  <User size={14} />
                  <span className="font-medium">{row.username}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                  <span className="font-semibold block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Disposal Method</span>
                  {row.method}
                </div>
              </div>
            ))}
            {paginatedHistory.length === 0 && (
              <div className="text-center py-12 px-4 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                No detection history found.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {histTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{histPage}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{histTotalPages}</span>
              <span className="ml-2 text-gray-500">
                ({(histPage - 1) * HIST_PER_PAGE + 1}–
                {Math.min(histPage * HIST_PER_PAGE, historyData.length)} of {historyData.length})
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToHistPage(histPage - 1)}
                disabled={histPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ‹ Prev
              </button>

              {getHistPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToHistPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    page === histPage
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-400/20 text-indigo-500 dark:text-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.3)]'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToHistPage(histPage + 1)}
                disabled={histPage === histTotalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    {/* --- Modals --- */}
      <AnimatePresence>
        {/* Delete Modal */}
        {deleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to permanently delete user <span className="font-semibold text-gray-900 dark:text-white">'{userToDelete.username}'</span> and all their history? This action cannot be undone.
                </p>
                <div className="flex w-full gap-3">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteUser}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Modal */}
        {viewModalOpen && userToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0a1321] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <User className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
                    <p className="text-sm text-gray-500">ID: #{userToView.id}</p>
                  </div>
                </div>
                <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Username</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{userToView.username}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Role</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${userToView.role === 'admin' ? 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                    {userToView.role.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Total Scans</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{userToView.scans_count} scans</span>
                </div>
              </div>

              <button 
                onClick={() => setViewModalOpen(false)}
                className="w-full mt-6 px-4 py-2.5 rounded-xl font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Admin;
