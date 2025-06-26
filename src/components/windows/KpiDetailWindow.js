// src/components/windows/KpiDetailWindow.js
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Eye,
  Users,
  Briefcase,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import KpiService from '../../services/kpiService';
import { formatCurrency, formatDate, downloadAsJSON } from '../../utils/helpers';
import logger from '../../utils/logger';

const KpiDetailWindow = ({ window }) => {
  const { token } = useAuth();
  const [kpiService] = useState(() => new KpiService(token));
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: windowData } = window;
  const kpiConfig = windowData?.kpiConfig || {};
  const kpiId = windowData?.record?.id || kpiConfig.id;

  // Fetch detailed KPI data
  const fetchDetailData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info(`Fetching detailed data for KPI: ${kpiId}`);
      
      // Get comprehensive KPI data
      const response = await kpiService.getDashboardKpis();
      
      if (response.success) {
        // Extract specific KPI data
        const kpiData = extractKpiData(response.kpis, kpiId);
        setDetailData(kpiData);
      } else {
        throw new Error(response.error || 'Failed to fetch KPI details');
      }
      
    } catch (err) {
      logger.error('Failed to fetch KPI detail data:', err);
      setError(err.message);
      
      // Set mock data for demo purposes
      setDetailData(generateMockDetailData(kpiId));
    } finally {
      setLoading(false);
    }
  };

  // Extract specific KPI data based on ID
  const extractKpiData = (allKpis, kpiId) => {
    const baseData = {
      id: kpiId,
      timestamp: new Date().toISOString()
    };

    switch (kpiId) {
      case 'total_customers':
        return {
          ...baseData,
          title: 'Customer Analytics',
          ...allKpis.customers,
          charts: generateCustomerCharts(allKpis.customers),
          metrics: [
            { label: 'Total Customers', value: allKpis.customers.total, icon: Users, color: 'blue' },
            { label: 'Active Customers', value: allKpis.customers.active, icon: CheckCircle, color: 'green' },
            { label: 'New This Month', value: allKpis.customers.newThisMonth, icon: TrendingUp, color: 'purple' },
            { label: 'Average Rating', value: allKpis.customers.averageRating?.toFixed(1), icon: Star, color: 'yellow' }
          ]
        };
        
      case 'total_ustas':
        return {
          ...baseData,
          title: 'Usta Analytics',
          ...allKpis.ustas,
          charts: generateUstaCharts(allKpis.ustas),
          metrics: [
            { label: 'Total Ustas', value: allKpis.ustas.total, icon: Users, color: 'green' },
            { label: 'Active Ustas', value: allKpis.ustas.active, icon: CheckCircle, color: 'emerald' },
            { label: 'Verified Ustas', value: allKpis.ustas.verified, icon: Star, color: 'blue' },
            { label: 'Average Rating', value: allKpis.ustas.averageRating?.toFixed(1), icon: Star, color: 'yellow' }
          ]
        };
        
      case 'total_jobs':
      case 'open_jobs':
      case 'active_jobs':
      case 'completed_jobs':
      case 'cancelled_jobs':
        return {
          ...baseData,
          title: 'Job Analytics',
          ...allKpis.jobs,
          charts: generateJobCharts(allKpis.jobs),
          metrics: [
            { label: 'Total Jobs', value: allKpis.jobs.total, icon: Briefcase, color: 'purple' },
            { label: 'Open Jobs', value: allKpis.jobs.open, icon: Clock, color: 'orange' },
            { label: 'Active Jobs', value: allKpis.jobs.active, icon: TrendingUp, color: 'indigo' },
            { label: 'Completed Jobs', value: allKpis.jobs.completed, icon: CheckCircle, color: 'green' },
            { label: 'Completion Rate', value: `${allKpis.jobs.completionRate}%`, icon: Target, color: 'emerald' }
          ]
        };
        
      case 'revenue':
        return {
          ...baseData,
          title: 'Revenue Analytics',
          ...allKpis.revenue,
          charts: generateRevenueCharts(allKpis.revenue),
          metrics: [
            { label: 'Total Revenue', value: formatCurrency(allKpis.revenue.total), icon: DollarSign, color: 'yellow' },
            { label: 'Monthly Revenue', value: formatCurrency(allKpis.revenue.monthly), icon: Calendar, color: 'green' },
            { label: 'Daily Average', value: formatCurrency(allKpis.revenue.daily), icon: BarChart3, color: 'blue' },
            { label: 'Average Per Job', value: formatCurrency(allKpis.revenue.averagePerJob), icon: Briefcase, color: 'purple' }
          ]
        };
        
      case 'services':
        return {
          ...baseData,
          title: 'Service Analytics',
          ...allKpis.services,
          charts: generateServiceCharts(allKpis.services),
          metrics: [
            { label: 'Total Services', value: allKpis.services.total, icon: Star, color: 'pink' },
            { label: 'Active Services', value: allKpis.services.active, icon: CheckCircle, color: 'green' },
            { label: 'Categories', value: allKpis.services.categories?.length || 0, icon: PieChart, color: 'indigo' },
            { label: 'Average Price', value: formatCurrency(allKpis.services.averagePrice), icon: DollarSign, color: 'yellow' }
          ]
        };
        
      default:
        return generateMockDetailData(kpiId);
    }
  };

  // Generate mock detail data for development
  const generateMockDetailData = (kpiId) => {
    const baseValue = Math.floor(Math.random() * 1000) + 100;
    
    return {
      id: kpiId,
      title: `${kpiId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Analytics`,
      total: baseValue,
      growth: (Math.random() - 0.5) * 20,
      timestamp: new Date().toISOString(),
      isMock: true,
      metrics: [
        { label: 'Total Count', value: baseValue, icon: BarChart3, color: 'blue' },
        { label: 'Growth Rate', value: `${((Math.random() - 0.5) * 20).toFixed(1)}%`, icon: TrendingUp, color: 'green' },
        { label: 'This Month', value: Math.floor(baseValue * 0.2), icon: Calendar, color: 'purple' },
        { label: 'Active', value: Math.floor(baseValue * 0.8), icon: CheckCircle, color: 'emerald' }
      ],
      charts: {
        trend: generateMockTrendData(),
        distribution: generateMockDistributionData(),
        comparison: generateMockComparisonData()
      }
    };
  };

  // Generate chart data
  const generateCustomerCharts = (data) => ({
    trend: [
      { name: 'Jan', value: data.total * 0.7 },
      { name: 'Feb', value: data.total * 0.75 },
      { name: 'Mar', value: data.total * 0.8 },
      { name: 'Apr', value: data.total * 0.85 },
      { name: 'May', value: data.total * 0.9 },
      { name: 'Jun', value: data.total }
    ],
    distribution: [
      { name: 'Active', value: data.active, color: '#10B981' },
      { name: 'Inactive', value: data.total - data.active, color: '#EF4444' }
    ]
  });

  const generateUstaCharts = (data) => ({
    trend: [
      { name: 'Jan', value: data.total * 0.6 },
      { name: 'Feb', value: data.total * 0.7 },
      { name: 'Mar', value: data.total * 0.8 },
      { name: 'Apr', value: data.total * 0.9 },
      { name: 'May', value: data.total * 0.95 },
      { name: 'Jun', value: data.total }
    ],
    verification: [
      { name: 'Verified', value: data.verified, color: '#3B82F6' },
      { name: 'Pending', value: data.total - data.verified, color: '#F59E0B' }
    ]
  });

  const generateJobCharts = (data) => ({
    status: [
      { name: 'Completed', value: data.completed, color: '#10B981' },
      { name: 'Active', value: data.active, color: '#6366F1' },
      { name: 'Open', value: data.open, color: '#F59E0B' },
      { name: 'Cancelled', value: data.cancelled, color: '#EF4444' }
    ],
    trend: [
      { name: 'Week 1', completed: data.completed * 0.2, new: data.open * 0.3 },
      { name: 'Week 2', completed: data.completed * 0.25, new: data.open * 0.25 },
      { name: 'Week 3', completed: data.completed * 0.3, new: data.open * 0.2 },
      { name: 'Week 4', completed: data.completed * 0.25, new: data.open * 0.25 }
    ]
  });

  const generateRevenueCharts = (data) => ({
    trend: [
      { name: 'Jan', value: data.total * 0.6 },
      { name: 'Feb', value: data.total * 0.7 },
      { name: 'Mar', value: data.total * 0.8 },
      { name: 'Apr', value: data.total * 0.85 },
      { name: 'May', value: data.total * 0.9 },
      { name: 'Jun', value: data.total }
    ],
    sources: [
      { name: 'Cleaning', value: data.total * 0.4, color: '#3B82F6' },
      { name: 'Plumbing', value: data.total * 0.25, color: '#10B981' },
      { name: 'Electrical', value: data.total * 0.2, color: '#F59E0B' },
      { name: 'Other', value: data.total * 0.15, color: '#EF4444' }
    ]
  });

  const generateServiceCharts = (data) => ({
    categories: data.categories?.map((cat, index) => ({
      name: cat,
      value: Math.floor(data.total / data.categories.length) + Math.floor(Math.random() * 10),
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    })) || [],
    popularity: data.popularServices?.map((service, index) => ({
      name: service,
      bookings: Math.floor(Math.random() * 100) + 50,
      rating: 4 + Math.random()
    })) || []
  });

  // Mock chart data generators
  const generateMockTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      value: Math.floor(Math.random() * 100) + 50
    }));
  };

  const generateMockDistributionData = () => [
    { name: 'Category A', value: 35, color: '#3B82F6' },
    { name: 'Category B', value: 25, color: '#10B981' },
    { name: 'Category C', value: 20, color: '#F59E0B' },
    { name: 'Category D', value: 20, color: '#EF4444' }
  ];

  const generateMockComparisonData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => ({
      name: week,
      current: Math.floor(Math.random() * 50) + 25,
      previous: Math.floor(Math.random() * 50) + 25
    }));
  };

  // Handle data export
  const handleExport = () => {
    if (detailData) {
      downloadAsJSON(detailData, `${kpiId}_detailed_analytics.json`);
    }
  };

  // Get color classes for metrics
  const getMetricColors = (color) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      emerald: 'text-emerald-600 bg-emerald-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      pink: 'text-pink-600 bg-pink-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Render chart placeholder (in a real app, you'd use a charting library)
  const ChartPlaceholder = ({ title, data, type = 'line' }) => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <div className="text-gray-600 mb-2">
        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
        <div className="font-medium">{title}</div>
      </div>
      <div className="text-sm text-gray-500">
        {type === 'pie' ? 'Pie Chart' : type === 'bar' ? 'Bar Chart' : 'Line Chart'} visualization
      </div>
      {data && (
        <div className="mt-3 text-xs text-gray-400">
          Data points: {Array.isArray(data) ? data.length : Object.keys(data).length}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    fetchDetailData();
  }, [kpiId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading detailed analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !detailData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDetailData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'breakdown', label: 'Breakdown', icon: PieChart }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {detailData.title}
            </h3>
            <p className="text-sm text-gray-500">
              Detailed analytics and insights
            </p>
          </div>
          {detailData.isMock && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              Demo Data
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            title="Export data"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={fetchDetailData}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {detailData.metrics?.map((metric, index) => {
                  const Icon = metric.icon;
                  const colors = getMetricColors(metric.color);
                  
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {detailData.growth && index === 0 && (
                          <div className={`flex items-center text-sm ${
                            detailData.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {detailData.growth > 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            <span>{Math.abs(detailData.growth).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metric.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Performance Highlights</h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Strong growth trajectory this quarter
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Above average satisfaction rates
                    </li>
                    <li className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                      Consistent month-over-month improvement
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recent Activity</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Last updated: {formatDate(detailData.timestamp)}</div>
                    <div>Data source: {detailData.isMock ? 'Demo data' : 'Live database'}</div>
                    <div>Refresh rate: Real-time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder 
                  title="6-Month Trend" 
                  data={detailData.charts?.trend} 
                  type="line"
                />
                <ChartPlaceholder 
                  title="Growth Comparison" 
                  data={detailData.charts?.comparison} 
                  type="bar"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Breakdown</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder 
                  title="Distribution" 
                  data={detailData.charts?.distribution} 
                  type="pie"
                />
                <ChartPlaceholder 
                  title="Category Analysis" 
                  data={detailData.charts?.categories} 
                  type="bar"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiDetailWindow;