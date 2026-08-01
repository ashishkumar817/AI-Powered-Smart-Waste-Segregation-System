import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Search, Filter, Download, Trash, User, X, Calendar, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import ActionModal from '../components/ActionModal';
import { AuthContext } from '../context/AuthContext';

const getStatusColor = (conf) => {
  if (conf >= 95) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (conf >= 90) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
};

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const { token, user } = useContext(AuthContext);

  // --- Pagination ---
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // ------------------

  // --- Export Modal State ---
  const [showExportModal, setShowExportModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [exportFilters, setExportFilters] = useState({
    startDate: '',
    endDate: '',
    wasteType: 'All',
    user: 'All',
    minConfidence: 0
  });
  // --------------------------

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

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

  const clearHistory = () => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Clear History',
      message: 'Are you sure you want to clear your entire history? This cannot be undone.',
      confirmText: 'Delete All',
      onConfirm: async () => {
        try {
          const response = await fetch('http://localhost:5000/api/history', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            loadHistory();
          }
        } catch (err) {
          console.error("Failed to clear history", err);
        }
      }
    });
  };

  const deleteItem = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/history/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            loadHistory();
          }
        } catch (err) {
          console.error("Failed to delete item", err);
        }
      }
    });
  };

  const filteredHistory = historyData.filter(item => 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.date.includes(searchTerm)
  );

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Build up to 5 visible page number buttons
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Get unique waste types and users for the dropdowns
  const uniqueWasteTypes = useMemo(() => {
    const types = new Set();
    historyData.forEach(item => {
      // Basic splitting if multiple items exist like "Plastic (x2), Glass"
      const parts = item.type.split(',');
      parts.forEach(p => {
        const match = p.match(/([a-zA-Z]+)/);
        if (match) types.add(match[1].trim());
      });
    });
    return ['All', ...Array.from(types).sort()];
  }, [historyData]);

  const uniqueUsers = useMemo(() => {
    const users = new Set();
    historyData.forEach(item => {
      if (item.username) users.add(item.username);
    });
    return ['All', ...Array.from(users).sort()];
  }, [historyData]);

  const generateCSV = (dataToExport, filename) => {
    if (dataToExport.length === 0) {
      setModalConfig({
        isOpen: true,
        type: 'alert',
        title: 'No Data',
        message: 'There is no data to export matching your current filters.',
        confirmText: 'OK'
      });
      return;
    }
    
    const headers = ['Waste Type', 'Confidence', 'Date', 'Time', 'Disposal Method'];
    if (user?.role === 'admin') {
      headers.unshift('User');
    }
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    dataToExport.forEach(row => {
      const values = [];
      if (user?.role === 'admin') {
        values.push(`"${row.username || ''}"`);
      }
      values.push(`"${row.type}"`);
      values.push(`${row.conf}`);
      values.push(`"${row.date}"`);
      values.push(`"${row.time}"`);
      values.push(`"${row.method}"`);
      csvRows.push(values.join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setShowExportModal(false);
  };

  const exportFilteredCSV = () => {
    const dataToExport = historyData.filter(item => {
      // Date filter
      if (exportFilters.startDate && item.date < exportFilters.startDate) return false;
      if (exportFilters.endDate && item.date > exportFilters.endDate) return false;
      
      // Waste Type filter
      if (exportFilters.wasteType !== 'All' && !item.type.toLowerCase().includes(exportFilters.wasteType.toLowerCase())) return false;
      
      // User filter
      if (user?.role === 'admin' && exportFilters.user !== 'All' && item.username !== exportFilters.user) return false;

      // Confidence filter
      if (item.conf < exportFilters.minConfidence) return false;

      return true;
    });

    generateCSV(dataToExport, `waste_history_filtered.csv`);
  };

  const exportAllCSV = () => {
    generateCSV(historyData, `waste_history_all.csv`);
  };

  const renderDisposalMethod = (methodStr) => {
    if (!methodStr) return null;
    if (methodStr.includes(' | ')) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {methodStr.split(' | ').map((item, idx) => (
            <span key={idx} className="bg-gray-100 dark:bg-white/10 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/20 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium shadow-sm">
              {item}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-gray-700 dark:text-gray-300">{methodStr}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Detection History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and search through past waste classifications.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {user?.role === 'admin' && (
            <Button variant="secondary" className="px-4 py-2" onClick={clearHistory}>
              <Trash size={18} className="text-red-400" />
              Clear All History
            </Button>
          )}
          <Button variant="secondary" className="px-4 py-2" onClick={() => setShowExportModal(true)}>
            <Filter size={18} />
            Export Data
          </Button>
        </div>
      </div>

      <GlassCard tilt={false} className="!p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-white/5">
          <div className="relative w-full max-w-md text-gray-500 dark:text-gray-400 focus-within:text-gray-900 dark:focus-within:text-white">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            <input 
              type="text"
              placeholder="Search by waste type or date..."
              className="w-full bg-white dark:bg-primary-navy/50 border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredHistory.length} {filteredHistory.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        {/* Responsive Table & Cards */}
        <div className="min-h-[300px]">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
                  {user?.role === 'admin' && <th className="px-6 py-4 font-medium">User</th>}
                  <th className="px-6 py-4 font-medium">Waste Type</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Disposal Method</th>
                  {user?.role === 'admin' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {paginatedHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                          <User size={14} />
                          <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{row.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(row.conf)}`}>
                        {row.conf}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {row.time}
                    </td>
                    <td className="px-6 py-4 min-w-[250px] whitespace-normal text-gray-700 dark:text-gray-300">
                      {renderDisposalMethod(row.method)}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => deleteItem(row.id)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded transition-colors"
                          title="Delete Entry"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {paginatedHistory.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? "7" : "5"} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? "No matching records found." : "No detections yet. Go to Detect page to start!"}
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
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg w-fit">
                    <User size={14} />
                    <span className="font-medium">{row.username}</span>
                  </div>
                )}
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                  <span className="font-semibold block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Disposal Method</span>
                  {renderDisposalMethod(row.method)}
                </div>
                {user?.role === 'admin' && (
                  <div className="mt-2 pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end">
                    <button 
                      onClick={() => deleteItem(row.id)}
                      className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 min-w-[44px] min-h-[44px] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {paginatedHistory.length === 0 && (
              <div className="text-center py-12 px-4 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                {searchTerm ? "No matching records found." : "No detections yet. Go to Detect page to start!"}
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                ({(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredHistory.length)} of {filteredHistory.length})
              </span>
            </p>

            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ‹ Prev
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    page === currentPage
                      ? 'border-primary-green bg-primary-green/10 dark:bg-primary-green/20 text-primary-green shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* --- Export Modal --- */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowExportModal(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0a1321] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-green/10 text-primary-green rounded-lg">
                    <Download size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export CSV</h2>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body (Filters) */}
              <div className="p-6 space-y-5">
                
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Calendar size={16} /> Date Range
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-green"
                      value={exportFilters.startDate}
                      onChange={(e) => setExportFilters({...exportFilters, startDate: e.target.value})}
                    />
                    <span className="text-gray-400">to</span>
                    <input 
                      type="date" 
                      className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-green"
                      value={exportFilters.endDate}
                      onChange={(e) => setExportFilters({...exportFilters, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Waste Type Filter */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Filter size={16} /> Waste Type
                    </label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-green"
                      value={exportFilters.wasteType}
                      onChange={(e) => setExportFilters({...exportFilters, wasteType: e.target.value})}
                    >
                      {uniqueWasteTypes.map(type => (
                        <option key={type} value={type} className="dark:bg-[#0a1321]">{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* User Filter (Admin Only) */}
                  {user?.role === 'admin' && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <User size={16} /> User
                      </label>
                      <select 
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary-green"
                        value={exportFilters.user}
                        onChange={(e) => setExportFilters({...exportFilters, user: e.target.value})}
                      >
                        {uniqueUsers.map(u => (
                          <option key={u} value={u} className="dark:bg-[#0a1321]">{u}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Confidence Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Settings2 size={16} /> Minimum Confidence
                    </label>
                    <span className="text-sm font-bold text-primary-green">{exportFilters.minConfidence}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={exportFilters.minConfidence}
                    onChange={(e) => setExportFilters({...exportFilters, minConfidence: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-green"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row justify-end items-center gap-3">
                <Button variant="secondary" onClick={exportAllCSV} className="w-full sm:w-auto gap-2 border-gray-300 dark:border-white/20 hover:border-gray-400">
                  <Download size={16} /> Download All
                </Button>
                <Button variant="secondary" onClick={() => setShowExportModal(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="primary" onClick={exportFilteredCSV} className="w-full sm:w-auto gap-2">
                  <Download size={16} /> Download Filtered
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ActionModal 
        {...modalConfig}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default History;
