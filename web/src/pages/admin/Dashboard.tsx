import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
  monthlyRevenue: number;
  booksAddedThisMonth: number;
  newUsersThisMonth: number;
  booksTrend: 'up' | 'down';
  usersTrend: 'up' | 'down';
}

interface RecentActivity {
  id: string;
  type: 'book' | 'user' | 'loan' | 'system';
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity'),
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpenIcon className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      case 'loan':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'system':
        return <CogIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const quickActions = [
    {
      name: 'Manage Books',
      icon: BookOpenIcon,
      href: '/admin/books',
      description: 'Add, edit, or remove books',
    },
    {
      name: 'User Management',
      icon: UserGroupIcon,
      href: '/admin/users',
      description: 'Manage users and permissions',
    },
    {
      name: 'Loan Management',
      icon: ClockIcon,
      href: '/admin/loans',
      description: 'Track and manage loans',
    },
    {
      name: 'Reports',
      icon: ChartBarIcon,
      href: '/admin/reports',
      description: 'Generate and view reports',
    },
    {
      name: 'Settings',
      icon: CogIcon,
      href: '/admin/settings',
      description: 'Configure system settings',
    },
    {
      name: 'Security',
      icon: ShieldCheckIcon,
      href: '/admin/security',
      description: 'Manage security settings',
    },
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
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening in your library today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpenIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Books
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalBooks}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {getTrendIcon(stats.booksTrend)}
                          <span className="ml-1">{stats.booksAddedThisMonth} this month</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.totalUsers}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {getTrendIcon(stats.usersTrend)}
                          <span className="ml-1">{stats.newUsersThisMonth} this month</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Loans
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.activeLoans}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                          <span>{stats.overdueLoans} overdue</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Monthly Revenue
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${stats.monthlyRevenue.toFixed(2)}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                          <span>{stats.totalFines} fines pending</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <action.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-sm text-gray-500 truncate">{action.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      By {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {recentActivity.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No recent activity
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 