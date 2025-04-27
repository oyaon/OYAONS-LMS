import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: Array<{
    id: string;
    book: {
      title: string;
      author: string;
    };
    dueDate: string;
    status: string;
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
        <p className="mt-1 text-gray-500">Here's what's happening in your library account.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Books</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats?.totalBooks || 0}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats?.activeLoans || 0}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Overdue Loans</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats?.overdueLoans || 0}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Loans</h3>
        </div>
        <div className="px-6 py-5">
          {stats?.recentLoans && stats.recentLoans.length > 0 ? (
            <div className="space-y-4">
              {stats.recentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{loan.book.title}</h4>
                    <p className="text-sm text-gray-500">{loan.book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        loan.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent loans</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 