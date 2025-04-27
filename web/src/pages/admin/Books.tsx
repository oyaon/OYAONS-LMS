import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  availableCopies: number;
  publishedYear: number;
  publisher: string;
}

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    copies: 1,
    publishedYear: new Date().getFullYear(),
    publisher: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Book>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minCopies: '',
    maxCopies: '',
    minAvailable: '',
    maxAvailable: '',
    publishedYear: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    // Extract unique categories from books
    const uniqueCategories = Array.from(new Set(books.map(book => book.category)));
    setCategories(uniqueCategories);
  }, [books]);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) return;

    try {
      await Promise.all(selectedBooks.map(id => api.delete(`/books/${id}`)));
      toast.success(`${selectedBooks.length} books deleted successfully`);
      setSelectedBooks([]);
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete books');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBooks(paginatedBooks.map(book => book.id));
    } else {
      setSelectedBooks([]);
    }
  };

  const handleSelectBook = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBooks([...selectedBooks, id]);
    } else {
      setSelectedBooks(selectedBooks.filter(bookId => bookId !== id));
    }
  };

  const applyAdvancedFilters = (books: Book[]) => {
    return books.filter(book => {
      const minCopies = parseInt(advancedFilters.minCopies);
      const maxCopies = parseInt(advancedFilters.maxCopies);
      const minAvailable = parseInt(advancedFilters.minAvailable);
      const maxAvailable = parseInt(advancedFilters.maxAvailable);
      const publishedYear = parseInt(advancedFilters.publishedYear);

      return (
        (isNaN(minCopies) || book.copies >= minCopies) &&
        (isNaN(maxCopies) || book.copies <= maxCopies) &&
        (isNaN(minAvailable) || book.availableCopies >= minAvailable) &&
        (isNaN(maxAvailable) || book.availableCopies <= maxAvailable) &&
        (isNaN(publishedYear) || book.publishedYear === publishedYear)
      );
    });
  };

  const filteredBooks = applyAdvancedFilters(
    books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === '' || book.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
  );

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', formData);
      toast.success('Book added successfully');
      setShowAddModal(false);
      fetchBooks();
      resetForm();
    } catch (error) {
      toast.error('Failed to add book');
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      await api.put(`/books/${selectedBook.id}`, formData);
      toast.success('Book updated successfully');
      setShowEditModal(false);
      fetchBooks();
      resetForm();
    } catch (error) {
      toast.error('Failed to update book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      copies: 1,
      publishedYear: new Date().getFullYear(),
      publisher: '',
    });
  };

  const handleSort = (field: keyof Book) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredBooks = [...filteredBooks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const totalPages = Math.ceil(sortedAndFilteredBooks.length / itemsPerPage);
  const paginatedBooks = sortedAndFilteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (field: keyof Book) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const data = sortedAndFilteredBooks.map(book => ({
        Title: book.title,
        Author: book.author,
        ISBN: book.isbn,
        Category: book.category,
        Copies: book.copies,
        'Available Copies': book.availableCopies,
        'Published Year': book.publishedYear,
        Publisher: book.publisher,
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Books exported successfully');
    } catch (error) {
      toast.error('Failed to export books');
    }
  };

  const getBookStatus = (book: Book) => {
    if (book.availableCopies === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: ExclamationCircleIcon,
      };
    } else if (book.availableCopies < book.copies * 0.2) {
      return {
        text: 'Low Stock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: InformationCircleIcon,
      };
    } else {
      return {
        text: 'In Stock',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircleIcon,
      };
    }
  };

  const handleQuickAction = async (action: 'addCopies' | 'markAvailable' | 'markUnavailable', book: Book) => {
    try {
      switch (action) {
        case 'addCopies':
          const copies = prompt('Enter number of copies to add:', '1');
          if (copies && !isNaN(parseInt(copies))) {
            await api.put(`/books/${book.id}`, {
              ...book,
              copies: book.copies + parseInt(copies),
              availableCopies: book.availableCopies + parseInt(copies),
            });
            toast.success(`${copies} copies added successfully`);
          }
          break;
        case 'markAvailable':
          await api.put(`/books/${book.id}`, {
            ...book,
            availableCopies: book.copies,
          });
          toast.success('All copies marked as available');
          break;
        case 'markUnavailable':
          await api.put(`/books/${book.id}`, {
            ...book,
            availableCopies: 0,
          });
          toast.success('All copies marked as unavailable');
          break;
      }
      fetchBooks();
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Books</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export JSON
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Book
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search books..."
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Advanced Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Copies</label>
                <input
                  type="number"
                  value={advancedFilters.minCopies}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, minCopies: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Copies</label>
                <input
                  type="number"
                  value={advancedFilters.maxCopies}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxCopies: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Available</label>
                <input
                  type="number"
                  value={advancedFilters.minAvailable}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, minAvailable: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Available</label>
                <input
                  type="number"
                  value={advancedFilters.maxAvailable}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxAvailable: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Published Year</label>
                <input
                  type="number"
                  value={advancedFilters.publishedYear}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, publishedYear: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedBooks.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-indigo-50 p-4 rounded-md">
            <div className="text-sm text-indigo-700">
              {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Selected
            </button>
          </div>
        )}

        {/* Items per page selector */}
        <div className="mb-4 flex justify-end">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Books Table */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedBooks.length === paginatedBooks.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  {[
                    { field: 'title', label: 'Title' },
                    { field: 'author', label: 'Author' },
                    { field: 'isbn', label: 'ISBN' },
                    { field: 'category', label: 'Category' },
                    { field: 'copies', label: 'Copies' },
                    { field: 'availableCopies', label: 'Available' },
                    { field: 'status', label: 'Status' },
                  ].map(({ field, label }) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => field !== 'status' && handleSort(field as keyof Book)}
                    >
                      <div className="flex items-center">
                        {label}
                        {field !== 'status' && getSortIcon(field as keyof Book)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBooks.map((book) => {
                  const status = getBookStatus(book);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book.id)}
                          onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.copies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.availableCopies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleQuickAction('addCopies', book)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Add Copies"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleQuickAction('markAvailable', book)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark All Available"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleQuickAction('markUnavailable', book)}
                          className="text-red-600 hover:text-red-900"
                          title="Mark All Unavailable"
                        >
                          <ExclamationCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setFormData({
                              title: book.title,
                              author: book.author,
                              isbn: book.isbn,
                              category: book.category,
                              copies: book.copies,
                              publishedYear: book.publishedYear,
                              publisher: book.publisher,
                            });
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Book"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Book"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, sortedAndFilteredBooks.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{sortedAndFilteredBooks.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {paginatedBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
              <form onSubmit={handleAddBook} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="copies" className="block text-sm font-medium text-gray-700">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    id="copies"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Edit Book</h3>
              <form onSubmit={handleEditBook} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="copies" className="block text-sm font-medium text-gray-700">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    id="copies"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books; 