import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  TableCellsIcon,
  ChartPieIcon,
  ChartLineIcon,
  ScatterPlotIcon,
  AreaChartIcon,
  TemplateIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Pie, Scatter, Area } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Report {
  id: string;
  name: string;
  type: 'table' | 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  data: any;
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  lastRun?: string;
  template?: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string;
  recipients: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: Report['type'];
  defaultFilters: ReportFilter[];
  defaultSchedule?: ReportSchedule;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'overdue-books',
    name: 'Overdue Books Report',
    description: 'Shows books that are overdue and their borrowers',
    type: 'table',
    defaultFilters: [
      { field: 'status', operator: 'equals', value: 'overdue' }
    ],
    defaultSchedule: {
      frequency: 'daily',
      time: '09:00',
      recipients: ['admin@library.com']
    }
  },
  {
    id: 'popular-books',
    name: 'Popular Books Analysis',
    description: 'Analyzes most borrowed books by category',
    type: 'bar',
    defaultFilters: [
      { field: 'borrowCount', operator: 'greater', value: '0' }
    ]
  },
  {
    id: 'user-activity',
    name: 'User Activity Trends',
    description: 'Shows user activity patterns over time',
    type: 'line',
    defaultSchedule: {
      frequency: 'weekly',
      time: '08:00',
      recipients: ['admin@library.com']
    }
  },
  {
    id: 'category-distribution',
    name: 'Book Category Distribution',
    description: 'Shows distribution of books across categories',
    type: 'pie',
    defaultFilters: []
  }
];

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportType, setReportType] = useState<'table' | 'line' | 'bar' | 'pie' | 'scatter' | 'area'>('table');
  const [reportName, setReportName] = useState('');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [schedule, setSchedule] = useState<ReportSchedule | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel' | 'json' | 'xml'>('csv');
  const [scheduleOptions, setScheduleOptions] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    time: '09:00',
    dayOfWeek: 'monday',
    dayOfMonth: '1',
    recipients: [''],
    includeAttachments: true,
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    timezone: 'UTC'
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const newReport = {
        name: reportName,
        type: reportType,
        filters,
        schedule,
      };
      await api.post('/admin/reports', newReport);
      toast.success('Report created successfully');
      setShowReportBuilder(false);
      fetchReports();
    } catch (error) {
      toast.error('Failed to create report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.delete(`/admin/reports/${reportId}`);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleCreateFromTemplate = (template: ReportTemplate) => {
    setReportName(template.name);
    setReportType(template.type);
    setFilters(template.defaultFilters);
    if (template.defaultSchedule) {
      setSchedule(template.defaultSchedule);
    }
    setShowTemplates(false);
    setShowReportBuilder(true);
  };

  const handleExportReport = async (reportId: string, format: typeof exportFormat) => {
    try {
      const response = await api.get(`/admin/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const renderChart = (report: Report) => {
    const chartData = {
      labels: report.data.labels,
      datasets: report.data.datasets,
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: report.name,
        },
      },
    };

    switch (report.type) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      case 'area':
        return <Area data={chartData} options={options} />;
      default:
        return null;
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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <TemplateIcon className="h-5 w-5 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setShowReportBuilder(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Report
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">
                    Last run: {report.lastRun ? new Date(report.lastRun).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => handleExportReport(report.id, e.target.value as typeof exportFormat)}
                    className="text-gray-400 hover:text-gray-500 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                  </select>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-400 hover:text-red-500"
                    title="Delete Report"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="h-64">
                {report.type === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {report.data.headers.map((header: string) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.data.rows.map((row: any[], index: number) => (
                          <tr key={index}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  renderChart(report)
                )}
              </div>

              {report.schedule && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>
                    Scheduled {report.schedule.frequency} at {report.schedule.time}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Report Templates</h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <div className="flex items-center">
                      {template.type === 'table' && <TableCellsIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      {template.type === 'line' && <ChartLineIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      {template.type === 'bar' && <ChartBarIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      {template.type === 'pie' && <ChartPieIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      {template.type === 'scatter' && <ScatterPlotIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      {template.type === 'area' && <AreaChartIcon className="h-6 w-6 text-gray-500 mr-2" />}
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{template.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Builder Modal */}
      {showReportBuilder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Report</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Name</label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <div className="mt-1 grid grid-cols-6 gap-4">
                    <button
                      onClick={() => setReportType('table')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'table' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <TableCellsIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Table</span>
                    </button>
                    <button
                      onClick={() => setReportType('line')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'line' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <ChartLineIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Line</span>
                    </button>
                    <button
                      onClick={() => setReportType('bar')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'bar' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <ChartBarIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Bar</span>
                    </button>
                    <button
                      onClick={() => setReportType('pie')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'pie' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <ChartPieIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Pie</span>
                    </button>
                    <button
                      onClick={() => setReportType('scatter')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'scatter' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <ScatterPlotIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Scatter</span>
                    </button>
                    <button
                      onClick={() => setReportType('area')}
                      className={`p-4 border rounded-md flex flex-col items-center ${
                        reportType === 'area' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      <AreaChartIcon className="h-6 w-6 text-gray-500" />
                      <span className="mt-2 text-sm">Area</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Filters</label>
                  <div className="mt-1 space-y-2">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={filter.field}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[index].field = e.target.value;
                            setFilters(newFilters);
                          }}
                          placeholder="Field"
                          className="block w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <select
                          value={filter.operator}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[index].operator = e.target.value;
                            setFilters(newFilters);
                          }}
                          className="block w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="greater">Greater Than</option>
                          <option value="less">Less Than</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[index].value = e.target.value;
                            setFilters(newFilters);
                          }}
                          placeholder="Value"
                          className="block w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setFilters([...filters, { field: '', operator: 'equals', value: '' }])
                      }
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Filter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule</label>
                  <div className="mt-1 space-y-2">
                    <select
                      value={scheduleOptions.frequency}
                      onChange={(e) =>
                        setScheduleOptions({
                          ...scheduleOptions,
                          frequency: e.target.value as typeof scheduleOptions.frequency,
                        })
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">No Schedule</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>

                    {scheduleOptions.frequency && (
                      <div className="space-y-2">
                        <input
                          type="time"
                          value={scheduleOptions.time}
                          onChange={(e) =>
                            setScheduleOptions({ ...scheduleOptions, time: e.target.value })
                          }
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />

                        {scheduleOptions.frequency === 'weekly' && (
                          <select
                            value={scheduleOptions.dayOfWeek}
                            onChange={(e) =>
                              setScheduleOptions({ ...scheduleOptions, dayOfWeek: e.target.value })
                            }
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                          </select>
                        )}

                        {scheduleOptions.frequency === 'monthly' && (
                          <select
                            value={scheduleOptions.dayOfMonth}
                            onChange={(e) =>
                              setScheduleOptions({ ...scheduleOptions, dayOfMonth: e.target.value })
                            }
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <option key={day} value={day.toString()}>
                                {day}
                              </option>
                            ))}
                          </select>
                        )}

                        <input
                          type="text"
                          value={scheduleOptions.recipients.join(', ')}
                          onChange={(e) =>
                            setScheduleOptions({
                              ...scheduleOptions,
                              recipients: e.target.value.split(',').map((email) => email.trim()),
                            })
                          }
                          placeholder="Recipient emails (comma-separated)"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={scheduleOptions.includeAttachments}
                              onChange={(e) =>
                                setScheduleOptions({
                                  ...scheduleOptions,
                                  includeAttachments: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Include Attachments</span>
                          </label>

                          <select
                            value={scheduleOptions.format}
                            onChange={(e) =>
                              setScheduleOptions({
                                ...scheduleOptions,
                                format: e.target.value as typeof scheduleOptions.format,
                              })
                            }
                            className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                          </select>

                          <select
                            value={scheduleOptions.timezone}
                            onChange={(e) =>
                              setScheduleOptions({
                                ...scheduleOptions,
                                timezone: e.target.value,
                              })
                            }
                            className="block w-40 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="UTC">UTC</option>
                            <option value="EST">Eastern Time</option>
                            <option value="CST">Central Time</option>
                            <option value="PST">Pacific Time</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReportBuilder(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 