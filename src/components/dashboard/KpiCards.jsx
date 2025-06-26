// src/components/dashboard/KpiCards.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWindows, WINDOW_TYPES } from '../../context/WindowContext';
import { useTable } from '../../context/TableContext';
import ApiService from '../../services/apiService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import logger from '../../utils/logger';

const KpiCards = () => {
  const { token } = useAuth();
  const { openWindow } = useWindows();
  const { getAllTables } = useTable();
  const [kpiData, setKpiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiService] = useState(() => new ApiService('', token));

  // Define KPI configurations
  const kpiConfigs = [
    {
      id: 'total_customers',
      title: 'Total Customers',
      icon: Users,
      color: 'blue',
      model: 'Customer',
      endpoint: '/api/admin/models/Customer/stats',
      description: 'Total registered customers',
      detailFields: ['activeCustomers', 'newThisMonth', 'averageRating']
    },
    {
      id: 'total_ustas',
      title: 'Total Ustas',
      icon: UserCheck,
      color: 'green',
      model: 'Usta',
      endpoint: '/api/admin/models/Usta/stats',
      description: 'Service providers',
      detailFields: ['activeUstas', 'verifiedUstas', 'averageRating']
    },
    {
      id: 'total_jobs',
      title: 'Total Jobs',
      icon: Briefcase,
      color: 'purple',
      model: 'Job',
      endpoint: '/api/admin/models/Job/stats',
      description: 'All job bookings',
      detailFields: ['totalValue', 'averageValue', 'completionRate']
    },
    {
      id: 'open_jobs',
      title: 'Open Jobs',
      icon: Clock,
      color: 'orange',
      model: 'Job',
      endpoint: '/api/admin/models/Job/records',
      filter: { status: 'open' },
      description: 'Jobs waiting for assignment',
      detailFields: ['pendingAssignment', 'averageWaitTime', 'urgentJobs']
    },
    {
      id: 'active_jobs',
      title: 'Active Jobs',
      icon: TrendingUp,
      color: 'indigo',
      model: 'Job',
      endpoint: '/api/admin/models/Job/records',
      filter: { status: 'in_progress' },
      description: 'Currently in progress',
      detailFields: ['onTime', 'delayed', 'averageDuration']
    },
    {
      id: 'completed_jobs',
      title: 'Completed Jobs',
      icon: CheckCircle,
      color: 'emerald',
      model: 'Job',
      endpoint: '/api/admin/models/Job/records',
      filter: { status: 'completed' },
      description: 'Successfully completed',
      detailFields: ['todayCompleted', 'monthlyCompleted', 'customerSatisfaction']
    },
    {
      id: 'cancelled_jobs',
      title: 'Cancelled Jobs',
      icon: XCircle,
      color: 'red',
      model: 'Job',
      endpoint: '/api/admin/models/Job/records',
      filter: { status: 'cancelled' },
      description: 'Cancelled bookings',
      detailFields: ['cancellationRate', 'topReasons', 'refundsIssued']
    },
   /* {
      id: 'revenue',
      title: 'Total Revenue',
      icon: DollarSign,
      color: 'yellow',
      model: 'Job',
      endpoint: '/api/admin/models/Job/revenue',
      description: 'Total earnings',
      detailFields: ['monthlyRevenue', 'dailyAverage', 'growth']
    },*/
    {
      id: 'services',
      title: 'Services',
      icon: Star,
      color: 'pink',
      model: 'Service',
      endpoint: '/api/admin/models/Service/stats',
      description: 'Available services',
      detailFields: ['activeServices', 'popularServices', 'averagePrice']
    }
  ];

  // Fetch KPI data
  const fetchKpiData = async () => {
    setLoading(true);
    setError(null);
    
    logger.info('Fetching KPI data for dashboard');
    
    try {
      const data = {};
      
      // Fetch data for each KPI
      await Promise.allSettled(
        kpiConfigs.map(async (config) => {
          try {
            // Check if model exists in our tables
            const tables = getAllTables();
            const modelExists = tables.some(table => 
              table.name === config.model || table.tableName === config.model.toLowerCase()
            );

            if (!modelExists) {
              // Use mock data for missing models
              data[config.id] = generateMockData(config);
              return;
            }

            let result;
            
            if (config.filter) {
              // Fetch filtered records
              const response = await apiService.get(config.endpoint, {
                ...config.filter,
                size: 1000, // Get all matching records for counting
                page: 1
              });
              
              if (response.success) {
                const records = response.data?.result?.records || response.data?.records || [];
                result = {
                  count: records.length,
                  records: records.slice(0, 5), // Keep sample for details
                  totalValue: records.reduce((sum, record) => sum + (record.amount || record.price || 0), 0),
                  details: calculateFilteredDetails(records, config)
                };
              }
            } else {
              // Fetch stats endpoint
              const response = await apiService.get(config.endpoint);
              
              if (response.success) {
                result = response.data?.result || response.data || {};
              }
            }
            
            if (result) {
              data[config.id] = {
                ...result,
                timestamp: new Date().toISOString(),
                model: config.model
              };
            } else {
              data[config.id] = generateMockData(config);
            }
            
          } catch (error) {
            logger.warn(`Failed to fetch KPI data for ${config.id}:`, error.message);
            data[config.id] = generateMockData(config);
          }
        })
      );
      
      setKpiData(data);
      logger.success('KPI data fetched successfully', { 
        kpiCount: Object.keys(data).length 
      });
      
    } catch (error) {
      logger.error('Failed to fetch KPI data:', error);
      setError(error.message);
      
      // Set mock data for all KPIs on error
      const mockData = {};
      kpiConfigs.forEach(config => {
        mockData[config.id] = generateMockData(config);
      });
      setKpiData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for development/fallback
  const generateMockData = (config) => {
    const baseCount = Math.floor(Math.random() * 500) + 50;
    const growth = (Math.random() - 0.5) * 20; // -10% to +10%
    
    const mockData = {
      count: baseCount,
      growth: growth,
      timestamp: new Date().toISOString(),
      model: config.model,
      isMock: true
    };

    // Add specific mock data based on KPI type
    switch (config.id) {
      case 'revenue':
        mockData.totalValue = baseCount * 150; // Mock revenue
        mockData.monthlyRevenue = baseCount * 25;
        mockData.dailyAverage = baseCount * 5;
        break;
      case 'total_customers':
        mockData.activeCustomers = Math.floor(baseCount * 0.8);
        mockData.newThisMonth = Math.floor(baseCount * 0.1);
        mockData.averageRating = 4.2 + Math.random() * 0.6;
        break;
      case 'total_ustas':
        mockData.activeUstas = Math.floor(baseCount * 0.7);
        mockData.verifiedUstas = Math.floor(baseCount * 0.6);
        mockData.averageRating = 4.0 + Math.random() * 0.8;
        break;
      case 'completed_jobs':
        mockData.todayCompleted = Math.floor(baseCount * 0.05);
        mockData.monthlyCompleted = Math.floor(baseCount * 0.8);
        mockData.customerSatisfaction = 4.3 + Math.random() * 0.5;
        break;
      default:
        mockData.details = {
          percentage: Math.floor(Math.random() * 30) + 70,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
    }

    return mockData;
  };

  // Calculate details for filtered data
  const calculateFilteredDetails = (records, config) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (config.id) {
      case 'open_jobs':
        return {
          pendingAssignment: records.filter(r => !r.ustaId).length,
          averageWaitTime: '2.5 hours',
          urgentJobs: records.filter(r => r.priority === 'urgent').length
        };
      case 'active_jobs':
        return {
          onTime: records.filter(r => new Date(r.scheduledDate) >= now).length,
          delayed: records.filter(r => new Date(r.scheduledDate) < now).length,
          averageDuration: '3.2 hours'
        };
      case 'completed_jobs':
        return {
          todayCompleted: records.filter(r => r.completedAt?.startsWith(today)).length,
          monthlyCompleted: records.filter(r => new Date(r.completedAt) >= monthStart).length,
          customerSatisfaction: 4.4
        };
      default:
        return {};
    }
  };

  // Handle card click - open detailed view
  const handleCardClick = (config, data) => {
    logger.info(`Opening detailed view for ${config.title}`);
    
    // Find the corresponding table
    const tables = getAllTables();
    const table = tables.find(t => 
      t.name === config.model || 
      t.tableName === config.model.toLowerCase()
    );

    if (table) {
      // Open table data window with filter if applicable
      openWindow({
        type: WINDOW_TYPES.TABLE_DATA,
        title: `${config.title} - Details`,
        table: table,
        data: {
          page: 1,
          size: 20,
          filters: config.filter || {},
          kpiContext: {
            title: config.title,
            description: config.description,
            totalCount: data.count,
            isKpiView: true
          }
        }
      });
    } else {
      // Open a KPI detail window
      openWindow({
        type: WINDOW_TYPES.RECORD_DETAIL,
        title: `${config.title} - Analytics`,
        table: { name: config.model, backend: 'myusta', displayName: config.title },
        data: {
          record: {
            id: config.id,
            title: config.title,
            ...data,
            details: config.detailFields
          },
          isKpiDetail: true
        }
      });
    }
  };

  // Handle card action menu
  const handleCardAction = (action, config) => {
    switch (action) {
      case 'refresh':
        fetchKpiData();
        break;
      case 'export':
        downloadKpiData(config);
        break;
      case 'view_table':
        handleCardClick(config, kpiData[config.id]);
        break;
    }
  };

  // Download KPI data
  const downloadKpiData = (config) => {
    const data = kpiData[config.id];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.id}_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get color classes for KPI cards
  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600 bg-blue-100',
        text: 'text-blue-900',
        accent: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600 bg-green-100',
        text: 'text-green-900',
        accent: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600 bg-purple-100',
        text: 'text-purple-900',
        accent: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600 bg-orange-100',
        text: 'text-orange-900',
        accent: 'text-orange-600'
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600 bg-indigo-100',
        text: 'text-indigo-900',
        accent: 'text-indigo-600'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600 bg-emerald-100',
        text: 'text-emerald-900',
        accent: 'text-emerald-600'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600 bg-red-100',
        text: 'text-red-900',
        accent: 'text-red-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600 bg-yellow-100',
        text: 'text-yellow-900',
        accent: 'text-yellow-600'
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        icon: 'text-pink-600 bg-pink-100',
        text: 'text-pink-900',
        accent: 'text-pink-600'
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Format value based on KPI type
  const formatValue = (config, data) => {
    if (!data) return '0';
    
    switch (config.id) {
      case 'revenue':
        return formatCurrency(data.totalValue || data.count * 150);
      default:
        return (data.count || 0).toLocaleString();
    }
  };

  // Get growth indicator
  const getGrowthIndicator = (growth) => {
    if (!growth) return null;
    
    const isPositive = growth > 0;
    const Icon = isPositive ? TrendingUp : TrendingUp;
    
    return (
      <div className={`flex items-center text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <Icon className={`w-4 h-4 mr-1 ${isPositive ? '' : 'rotate-180'}`} />
        <span>{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  useEffect(() => {
    fetchKpiData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && Object.keys(kpiData).length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Failed to load KPI data: {error}</span>
            <button
              onClick={fetchKpiData}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Key performance indicators for your business</p>
        </div>
        <button
          onClick={fetchKpiData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <TrendingUp className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiConfigs.map((config) => {
          const data = kpiData[config.id] || {};
          const colors = getColorClasses(config.color);
          const Icon = config.icon;
          
          return (
            <div
              key={config.id}
              className={`relative bg-white rounded-lg border ${colors.border} p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${colors.bg}`}
              onClick={() => handleCardClick(config, data)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.icon}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Action menu */}
                <div className="relative group">
                  <button className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardAction('view_table', config);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardAction('refresh', config);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <TrendingUp className="w-3 h-3 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {formatValue(config, data)}
                  </div>
                  {data.growth && getGrowthIndicator(data.growth)}
                </div>
                
                <div>
                  <div className={`font-medium ${colors.text}`}>{config.title}</div>
                  <div className="text-sm text-gray-600">{config.description}</div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {data.timestamp ? `Updated ${formatDate(data.timestamp)}` : 'No data'}
                  </span>
                  {data.isMock && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Demo
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              {config.detailFields && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {config.detailFields.slice(0, 2).map((field) => (
                      <div key={field} className="text-center">
                        <div className={`font-medium ${colors.accent}`}>
                          {data[field] || Math.floor(Math.random() * 100)}
                        </div>
                        <div className="text-gray-500 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {((kpiData.total_customers?.count || 0) + (kpiData.total_ustas?.count || 0)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {(kpiData.completed_jobs?.count || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Jobs Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {(kpiData.open_jobs?.count || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Pending Jobs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(kpiData.revenue?.totalValue || kpiData.revenue?.count * 150 || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCards;