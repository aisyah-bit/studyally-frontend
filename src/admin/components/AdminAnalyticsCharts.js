import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Users,
  TrendingUp,
  BookOpen,
  Activity,
  Target,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Professional admin color palette
const ADMIN_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  slate: '#64748b',
  purple: '#8b5cf6'
};

// Chart options for consistent styling
const getChartOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#667eea',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        },
        color: '#64748b'
      }
    },
    y: {
      grid: {
        color: '#f1f5f9'
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        },
        color: '#64748b'
      }
    }
  }
});

// User Growth Chart Component
export const AdminUserGrowthChart = ({ data, totalUsers, growthRate }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'New Users',
        data: data.map(item => item.count),
        borderColor: ADMIN_COLORS.primary,
        backgroundColor: `${ADMIN_COLORS.primary}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: ADMIN_COLORS.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  return (
    <div className="admin-chart-container">
      <div className="admin-chart-header">
        <div className="admin-chart-title-section">
          <div className="admin-chart-icon" style={{ color: ADMIN_COLORS.primary }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3>User Growth</h3>
            <p className="admin-chart-subtitle">New user registrations over time</p>
          </div>
        </div>
        <div className="admin-chart-stats">
          <div className="admin-stat-item">
            <span className="admin-stat-value">{totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-value" style={{ color: growthRate >= 0 ? ADMIN_COLORS.success : ADMIN_COLORS.error }}>
              {growthRate >= 0 ? '+' : ''}{growthRate}
            </span>
            <span className="admin-stat-label">This Week</span>
          </div>
        </div>
      </div>
      <div className="admin-chart-content">
        <Line data={chartData} options={getChartOptions('User Growth')} />
      </div>
    </div>
  );
};

// Group Analytics Chart Component
export const AdminGroupAnalyticsChart = ({ data, subjectDistribution, totalGroups, completionRate }) => {
  const chartData = {
    labels: subjectDistribution.map(item => item.subject),
    datasets: [
      {
        data: subjectDistribution.map(item => item.count),
        backgroundColor: [
          ADMIN_COLORS.primary,
          ADMIN_COLORS.secondary,
          ADMIN_COLORS.success,
          ADMIN_COLORS.warning,
          ADMIN_COLORS.info,
          ADMIN_COLORS.purple
        ],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    cutout: '60%'
  };

  return (
    <div className="admin-chart-container">
      <div className="admin-chart-header">
        <div className="admin-chart-title-section">
          <div className="admin-chart-icon" style={{ color: ADMIN_COLORS.secondary }}>
            <PieChart size={24} />
          </div>
          <div>
            <h3>Study Subjects</h3>
            <p className="admin-chart-subtitle">Distribution of study groups by subject</p>
          </div>
        </div>
        <div className="admin-chart-stats">
          <div className="admin-stat-item">
            <span className="admin-stat-value">{totalGroups}</span>
            <span className="admin-stat-label">Total Groups</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-value" style={{ color: ADMIN_COLORS.success }}>
              {completionRate}%
            </span>
            <span className="admin-stat-label">Completion</span>
          </div>
        </div>
      </div>
      <div className="admin-chart-content">
        <Doughnut data={chartData} options={doughnutOptions} />
      </div>
    </div>
  );
};

// Activity Chart Component
export const AdminActivityChart = ({ data, activeGroups, activeUsers }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Groups Created',
        data: data.map(item => item.groups),
        backgroundColor: ADMIN_COLORS.success,
        borderColor: ADMIN_COLORS.success,
        borderWidth: 1
      },
      {
        label: 'Users Joined',
        data: data.map(item => item.users),
        backgroundColor: ADMIN_COLORS.info,
        borderColor: ADMIN_COLORS.info,
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="admin-chart-container">
      <div className="admin-chart-header">
        <div className="admin-chart-title-section">
          <div className="admin-chart-icon" style={{ color: ADMIN_COLORS.success }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h3>Platform Activity</h3>
            <p className="admin-chart-subtitle">Daily activity trends</p>
          </div>
        </div>
        <div className="admin-chart-stats">
          <div className="admin-stat-item">
            <span className="admin-stat-value">{activeGroups}</span>
            <span className="admin-stat-label">Active Groups</span>
          </div>
          <div className="admin-stat-item">
            <span className="admin-stat-value">{activeUsers}</span>
            <span className="admin-stat-label">Active Users</span>
          </div>
        </div>
      </div>
      <div className="admin-chart-content">
        <Bar data={chartData} options={getChartOptions('Platform Activity')} />
      </div>
    </div>
  );
};

// Engagement Metrics Component
export const AdminEngagementChart = ({ engagementMetrics, platformHealth, averageGroupSize }) => {
  const metrics = [
    {
      label: 'Daily Active',
      value: engagementMetrics.dailyActiveUsers,
      icon: <Users size={20} />,
      color: ADMIN_COLORS.primary
    },
    {
      label: 'Weekly Active',
      value: engagementMetrics.weeklyActiveUsers,
      icon: <Activity size={20} />,
      color: ADMIN_COLORS.success
    },
    {
      label: 'User Retention',
      value: `${platformHealth.userRetentionRate}%`,
      icon: <Target size={20} />,
      color: ADMIN_COLORS.warning
    },
    {
      label: 'Platform Health',
      value: `${platformHealth.platformUtilization}%`,
      icon: <Award size={20} />,
      color: ADMIN_COLORS.info
    }
  ];

  return (
    <div className="admin-chart-container">
      <div className="admin-chart-header">
        <div className="admin-chart-title-section">
          <div className="admin-chart-icon" style={{ color: ADMIN_COLORS.warning }}>
            <Target size={24} />
          </div>
          <div>
            <h3>Engagement Metrics</h3>
            <p className="admin-chart-subtitle">User engagement and platform health</p>
          </div>
        </div>
      </div>
      <div className="admin-engagement-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="admin-engagement-item">
            <div className="admin-engagement-icon" style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className="admin-engagement-content">
              <span className="admin-engagement-value">{metric.value}</span>
              <span className="admin-engagement-label">{metric.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-additional-metrics">
        <div className="admin-metric-item">
          <span className="admin-metric-label">Average Group Size</span>
          <span className="admin-metric-value">{averageGroupSize} members</span>
        </div>
        <div className="admin-metric-item">
          <span className="admin-metric-label">Successful Groups</span>
          <span className="admin-metric-value">{platformHealth.successfulGroups}</span>
        </div>
      </div>
    </div>
  );
};
