import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  copies: Array<{
    id: string;
    status: string;
    location: string;
  }>;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCopy, setSelectedCopy] = useState<string>('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch (error) {
        toast.error('Failed to load book details');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, navigate]);

  const handleLoan = async () => {
    if (!selectedCopy) {
      toast.error('Please select a book copy');
      return;
    }

    try {
      await api.post('/loans', {
        bookId: book?.id,
        bookCopyId: selectedCopy,
      });
      toast.success('Book loaned successfully');
      navigate('/loans');
    } catch (error) {
      toast.error('Failed to loan book');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="mt-1 text-lg text-gray-500">by {book.author}</p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">ISBN:</span> {book.isbn}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Category:</span> {book.category}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Available Copies:</span>{' '}
                {book.availableCopies}/{book.totalCopies}
              </p>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{book.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Copies</h3>
        </div>
        <div className="px-6 py-5">
          {book.copies.length > 0 ? (
            <div className="space-y-4">
              {book.copies.map((copy) => (
                <div
                  key={copy.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    copy.status === 'available' ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Copy #{copy.id}
                    </p>
                    <p className="text-sm text-gray-500">Location: {copy.location}</p>
                  </div>
                  {copy.status === 'available' ? (
                    <button
                      onClick={() => setSelectedCopy(copy.id)}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        selectedCopy === copy.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-indigo-600 border-indigo-600'
                      }`}
                    >
                      {selectedCopy === copy.id ? 'Selected' : 'Select'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No copies available</p>
          )}
        </div>
      </div>

      {book.availableCopies > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleLoan}
            disabled={!selectedCopy}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              selectedCopy
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Loan Book
          </button>
        </div>
      )}
    </div>
  );
};

export default BookDetails; 