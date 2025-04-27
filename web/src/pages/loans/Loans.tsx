import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon, ArrowPathIcon, BookOpenIcon, ClockIcon, DocumentTextIcon, TableCellsIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Loan {
  id: string;
  book: {
    title: string;
    author: string;
  };
  bookCopy: {
    id: string;
  };
  dueDate: string;
  status: string;
  canRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', text: 'Active' },
    overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' },
    returned: { color: 'bg-gray-100 text-gray-800', text: 'Returned' },
    renewed: { color: 'bg-blue-100 text-blue-800', text: 'Renewed' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || 
    { color: 'bg-gray-100 text-gray-800', text: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeBookDetails: true,
    includeUserDetails: false,
    includeTimestamps: true,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    action: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const pageSizes = [5, 10, 25, 50];

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await api.get('/loans');
        setLoans(response.data);
      } catch (error) {
        toast.error('Failed to load loans');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const handleRenew = async (loanId: string) => {
    try {
      await api.put(`/loans/${loanId}/renew`);
      toast.success('Loan renewed successfully');
      // Refresh loans list
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to renew loan');
    }
  };

  const handleReturn = async (loanId: string) => {
    try {
      await api.put(`/loans/${loanId}/return`);
      toast.success('Book returned successfully');
      // Refresh loans list
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to return book');
    }
  };

  const handleGenerateReceipt = async (loanId: string) => {
    setGeneratingPdf(loanId);
    try {
      const response = await api.get(`/loans/${loanId}/receipt`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-receipt-${loanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate receipt');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleGenerateInvoice = async (loanId: string) => {
    setGeneratingPdf(loanId);
    try {
      const response = await api.get(`/loans/${loanId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-invoice-${loanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'csv') {
        const headers = [
          'Book Title',
          'Author',
          'Copy ID',
          'Due Date',
          'Status',
          'Renewable',
          ...(exportOptions.includeTimestamps ? ['Created At', 'Updated At'] : []),
        ];

        const rows = loans.map(loan => [
          `"${loan.book.title}"`,
          `"${loan.book.author}"`,
          loan.bookCopy.id,
          new Date(loan.dueDate).toLocaleDateString(),
          loan.status,
          loan.canRenew ? 'Yes' : 'No',
          ...(exportOptions.includeTimestamps ? [
            new Date(loan.createdAt).toISOString(),
            new Date(loan.updatedAt).toISOString(),
          ] : []),
        ]);

        content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        filename = `loans_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = JSON.stringify(
          loans.map(loan => ({
            book: exportOptions.includeBookDetails ? {
              title: loan.book.title,
              author: loan.book.author,
            } : undefined,
            copyId: loan.bookCopy.id,
            dueDate: loan.dueDate,
            status: loan.status,
            canRenew: loan.canRenew,
            ...(exportOptions.includeTimestamps ? {
              createdAt: loan.createdAt,
              updatedAt: loan.updatedAt,
            } : {}),
          })),
          null,
          2
        );
        filename = `loans_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Loans exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export loans');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.book.author.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = selectedStatus.length === 0 || 
      selectedStatus.includes(loan.status);

    // Year filter
    const matchesYear = !selectedYear || 
      new Date(loan.dueDate).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return sortOrder === 'asc'
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    if (sortBy === 'title') {
      return sortOrder === 'asc'
        ? a.book.title.localeCompare(b.book.title)
        : b.book.title.localeCompare(a.book.title);
    }
    return sortOrder === 'asc'
      ? a.status.localeCompare(b.status)
      : b.status.localeCompare(a.status);
  });

  const filteredByDate = sortedLoans.filter((loan) => {
    if (!dateRange.start && !dateRange.end) return true;
    
    const loanDate = new Date(loan.dueDate);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    if (startDate && loanDate < startDate) return false;
    if (endDate && loanDate > endDate) return false;
    
    return true;
  });

  const availableYears = Array.from(
    new Set(loans.map(loan => new Date(loan.dueDate).getFullYear()))
  ).sort((a, b) => b - a);

  const loanStats = {
    total: loans.length,
    active: loans.filter(loan => loan.status === 'active').length,
    overdue: loans.filter(loan => loan.status === 'overdue').length,
    returned: loans.filter(loan => loan.status === 'returned').length,
    renewed: loans.filter(loan => loan.status === 'renewed').length,
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = sortedLoans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLoans.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const quickActions = [
    {
      name: 'Renew All Eligible',
      icon: ArrowPathIcon,
      action: () => {
        const eligibleLoans = loans.filter(loan => loan.status === 'active' && loan.canRenew);
        if (eligibleLoans.length === 0) {
          toast.error('No eligible loans to renew');
          return;
        }
        
        setShowConfirmDialog({
          action: 'renew',
          message: `Are you sure you want to renew ${eligibleLoans.length} eligible loans?`,
          onConfirm: async () => {
            try {
              await Promise.all(eligibleLoans.map(loan => api.put(`/loans/${loan.id}/renew`)));
              toast.success(`Successfully renewed ${eligibleLoans.length} loans`);
              const response = await api.get('/loans');
              setLoans(response.data);
            } catch (error) {
              toast.error('Failed to renew loans');
            }
          },
        });
      },
      description: 'Renew all eligible active loans',
      color: 'bg-green-100 text-green-800 hover:bg-green-200'
    },
    {
      name: 'View Overdue',
      icon: ClockIcon,
      action: () => {
        setSelectedStatus(['overdue']);
        setCurrentPage(1);
      },
      description: 'Filter to show only overdue loans',
      color: 'bg-red-100 text-red-800 hover:bg-red-200'
    },
    {
      name: 'View Active',
      icon: BookOpenIcon,
      action: () => {
        setSelectedStatus(['active']);
        setCurrentPage(1);
      },
      description: 'Filter to show only active loans',
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="export-format" className="text-sm text-gray-700">
                Format:
              </label>
              <select
                id="export-format"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || loans.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  {exportFormat === 'csv' ? (
                    <TableCellsIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                  )}
                  Export to {exportFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Export Options Modal */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Export Options</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeBookDetails}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeBookDetails: e.target.checked,
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include Book Details</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeTimestamps}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeTimestamps: e.target.checked,
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include Timestamps</span>
            </label>
          </div>
        </div>

        {/* Loan Statistics */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{loanStats.total}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{loanStats.active}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Overdue Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">{loanStats.overdue}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Returned Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-600">{loanStats.returned}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Renewed Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">{loanStats.renewed}</dd>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={action.action}
                className={`relative rounded-lg p-4 flex items-center space-x-3 ${action.color} transition-colors duration-200`}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium">{action.name}</p>
                  <p className="text-xs opacity-75">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              multiple
              value={selectedStatus}
              onChange={(e) => {
                const options = e.target.options;
                const values = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    values.push(options[i].value);
                  }
                }
                setSelectedStatus(values);
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
              <option value="renewed">Renewed</option>
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'title' | 'status')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Book Title</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">
              Order
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`${
                  activeTab === 'active'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Active Loans
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Loan History
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Confirm Action</h3>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{showConfirmDialog.message}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showConfirmDialog.onConfirm();
                    setShowConfirmDialog(null);
                  }}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    showConfirmDialog.action === 'renew'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {currentLoans.length > 0 ? (
          <>
            {currentLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {loan.book.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        by {loan.book.author}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Copy #{loan.bookCopy.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Due: {new Date(loan.dueDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(loan.status)}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                      {loan.status === 'active' && loan.canRenew && (
                        <button
                          onClick={() => handleRenew(loan.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Renew Loan
                        </button>
                      )}
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Return Book
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateReceipt(loan.id)}
                        disabled={generatingPdf === loan.id}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {generatingPdf === loan.id ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          'Download Receipt'
                        )}
                      </button>
                      {loan.status !== 'active' && (
                        <button
                          onClick={() => handleGenerateInvoice(loan.id)}
                          disabled={generatingPdf === loan.id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {generatingPdf === loan.id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            'Download Invoice'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, sortedLoans.length)}
                      </span>{' '}
                      of <span className="font-medium">{sortedLoans.length}</span> results
                    </p>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="items-per-page" className="text-sm text-gray-700">
                        Items per page:
                      </label>
                      <select
                        id="items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1); // Reset to first page when changing page size
                        }}
                        className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      >
                        {pageSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === page
                              ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {activeTab === 'active'
                ? 'No active loans'
                : 'No loan history available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loans; 