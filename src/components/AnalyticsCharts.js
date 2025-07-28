// ✅ src/components/AnalyticsCharts.js - Professional Business Dashboard with Enhanced Styling
import { Bar, Pie, Line } from 'react-chartjs-2';
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
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Professional color palette with vibrant yet sophisticated colors
const PROFESSIONAL_COLORS = {
  primary: '#6366f1',      // Vibrant indigo
  secondary: '#8b5cf6',    // Vibrant purple
  success: '#10b981',      // Vibrant emerald
  warning: '#f59e0b',      // Vibrant amber
  error: '#ef4444',        // Vibrant red
  info: '#06b6d4',         // Vibrant cyan
  slate: '#64748b',        // Professional slate
  orange: '#f97316',       // Vibrant orange
};

// Enhanced gradient colors for charts
const CHART_GRADIENTS = {
  blue: ['#6366f1', '#4f46e5', '#4338ca'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9'],
  green: ['#10b981', '#059669', '#047857'],
  amber: ['#f59e0b', '#d97706', '#b45309'],
  red: ['#ef4444', '#dc2626', '#b91c1c'],
  cyan: ['#06b6d4', '#0891b2', '#0e7490'],
  orange: ['#f97316', '#ea580c', '#c2410c'],
  slate: ['#64748b', '#475569', '#334155']
};

// Professional tooltip styling
const PROFESSIONAL_TOOLTIP = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  titleColor: '#f8fafc',
  bodyColor: '#e2e8f0',
  borderColor: '#475569',
  borderWidth: 1,
  cornerRadius: 8,
  padding: 12,
  titleFont: {
    size: 13,
    weight: '600',
    family: 'Inter, sans-serif'
  },
  bodyFont: {
    size: 12,
    family: 'Inter, sans-serif'
  },
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  usePointStyle: true
};

export function PeakStudyHourChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;

  // Enhanced chart data with professional styling
  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, CHART_GRADIENTS.purple[0]);
        gradient.addColorStop(0.5, CHART_GRADIENTS.purple[1]);
        gradient.addColorStop(1, CHART_GRADIENTS.purple[2]);
        return gradient;
      },
      borderColor: CHART_GRADIENTS.purple[1],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: CHART_GRADIENTS.purple[0],
      hoverBorderColor: CHART_GRADIENTS.purple[0],
      hoverBorderWidth: 3
    })) || []
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1600,
            easing: 'easeOutQuart',
            delay: (context) => context.dataIndex * 80
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: true,
              text: 'Peak Study Hours',
              font: {
                size: 16,
                family: 'Inter, sans-serif',
                weight: '600'
              },
              color: '#1e293b',
              padding: 20
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                title: function(context) {
                  return `🕐 ${context[0].label}`;
                },
                label: function(context) {
                  return `Study Sessions: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY + 1,
              ticks: {
                stepSize: 1,
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8
              },
              grid: {
                color: '#f1f5f9',
                lineWidth: 1,
                drawBorder: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              },
              title: {
                display: true,
                text: 'Sessions',
                font: {
                  size: 12,
                  family: 'Inter, sans-serif',
                  weight: '600'
                },
                color: '#64748b',
                padding: 8
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8
              },
              border: {
                color: '#cbd5e1',
                width: 1
              }
            }
          }
        }}
      />
    </div>
  );
}

export function SubjectPieChart({ data }) {
  // Enhanced professional color palette with vibrant yet sophisticated colors
  const enhancedColors = [
    CHART_GRADIENTS.blue[0],     // Vibrant indigo
    CHART_GRADIENTS.purple[0],   // Vibrant purple
    CHART_GRADIENTS.green[0],    // Vibrant emerald
    CHART_GRADIENTS.amber[0],    // Vibrant amber
    CHART_GRADIENTS.red[0],      // Vibrant red
    CHART_GRADIENTS.cyan[0],     // Vibrant cyan
    CHART_GRADIENTS.orange[0],   // Vibrant orange
    CHART_GRADIENTS.slate[0]     // Professional slate
  ];

  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: enhancedColors,
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverBorderColor: '#f8fafc',
      hoverOffset: 8,
      // Enhanced visual effects
      borderAlign: 'inner',
      spacing: 2
    })) || []
  };

  return (
    <div style={{ height: '180px', flex: 1 }}>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: 'easeOutQuart'
          },
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                padding: 8,
                color: '#1e293b',
                usePointStyle: true,
                pointStyle: 'circle',
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const dataset = data.datasets[0];
                      const backgroundColor = dataset.backgroundColor[i];
                      return {
                        text: label,
                        fillStyle: backgroundColor,
                        strokeStyle: backgroundColor,
                        lineWidth: 0,
                        pointStyle: 'circle',
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }}
      />
    </div>
  );
}

export function WeeklyGrowthChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;

  // Enhanced chart data with professional styling
  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      borderColor: CHART_GRADIENTS.cyan[0],
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
        return gradient;
      },
      borderWidth: 3,
      pointBackgroundColor: CHART_GRADIENTS.cyan[0],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: CHART_GRADIENTS.cyan[0],
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
      fill: true,
      tension: 0.4
    })) || []
  };

  return (
    <div style={{ height: '300px' }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: true,
              text: 'Study Group Growth This Week',
              font: {
                size: 16,
                family: 'Inter, sans-serif',
                weight: '600'
              },
              color: '#1e293b',
              padding: 20
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                title: function(context) {
                  return `📈 ${context[0].label}`;
                },
                label: function(context) {
                  return `New Groups: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY + 1,
              ticks: {
                stepSize: 1,
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8
              },
              grid: {
                color: '#f1f5f9',
                lineWidth: 1,
                drawBorder: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              },
              title: {
                display: true,
                text: 'New Groups',
                font: {
                  size: 12,
                  family: 'Inter, sans-serif',
                  weight: '600'
                },
                color: '#64748b',
                padding: 8
              }
            },
            x: {
              ticks: {
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8
              },
              grid: {
                color: '#f1f5f9',
                lineWidth: 1,
                drawBorder: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              }
            }
          }
        }}
      />
    </div>
  );
}

export function PopularSpotsChart({ data }) {
  // Enhanced professional chart styling with gradient effects
  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, CHART_GRADIENTS.blue[0]);
        gradient.addColorStop(0.5, CHART_GRADIENTS.blue[1]);
        gradient.addColorStop(1, CHART_GRADIENTS.blue[2]);
        return gradient;
      },
      borderColor: CHART_GRADIENTS.blue[1],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: CHART_GRADIENTS.blue[0],
      hoverBorderColor: CHART_GRADIENTS.blue[0],
      hoverBorderWidth: 3,
      // Enhanced shadow effect
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowBlur: 8,
      shadowColor: 'rgba(99, 102, 241, 0.2)'
    })) || []
  };

  return (
    <div style={{ height: "200px", flex: 1 }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1500,
            easing: 'easeOutQuart',
            delay: (context) => context.dataIndex * 100
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              display: false
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                title: function(context) {
                  return `📍 ${context[0].label}`;
                },
                label: function(context) {
                  return `Average Rating: ${context.parsed.y}/5.0 ⭐`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 10,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                maxRotation: 45,
                minRotation: 0,
                padding: 8
              },
              grid: {
                display: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              }
            },
            y: {
              beginAtZero: true,
              max: 5,
              ticks: {
                precision: 1,
                font: {
                  size: 10,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8,
                callback: function(value) {
                  return value.toFixed(1);
                }
              },
              grid: {
                color: '#f1f5f9',
                lineWidth: 1,
                drawBorder: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              },
              title: {
                display: true,
                text: 'Rating',
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '600'
                },
                color: '#64748b',
                padding: 4
              }
            }
          }
        }}
      />
    </div>
  );
}

export function ActiveMembersChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;

  // Enhanced professional chart styling with gradient effects
  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
        gradient.addColorStop(0, CHART_GRADIENTS.green[0]);
        gradient.addColorStop(0.5, CHART_GRADIENTS.green[1]);
        gradient.addColorStop(1, CHART_GRADIENTS.green[2]);
        return gradient;
      },
      borderColor: CHART_GRADIENTS.green[1],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: CHART_GRADIENTS.green[0],
      hoverBorderColor: CHART_GRADIENTS.green[0],
      hoverBorderWidth: 3,
      // Enhanced shadow effect
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowBlur: 8,
      shadowColor: 'rgba(16, 185, 129, 0.2)'
    })) || []
  };

  return (
    <div style={{ height: '180px', flex: 1 }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1400,
            easing: 'easeOutQuart',
            delay: (context) => context.dataIndex * 150
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              display: false
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                title: function(context) {
                  return `👥 ${context[0].label}`;
                },
                label: function(context) {
                  const value = context.parsed.y;
                  return `Active Members: ${value} ${value === 1 ? 'member' : 'members'}`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 10,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8,
                maxRotation: 30,
                minRotation: 0
              },
              grid: {
                display: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              }
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxY + 1,
              ticks: {
                stepSize: 1,
                font: {
                  size: 10,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                color: '#475569',
                padding: 8,
                callback: function(value) {
                  return Math.floor(value);
                }
              },
              grid: {
                color: '#f1f5f9',
                lineWidth: 1,
                drawBorder: false
              },
              border: {
                color: '#cbd5e1',
                width: 1
              },
              title: {
                display: true,
                text: 'Members',
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                  weight: '600'
                },
                color: '#64748b',
                padding: 4
              }
            }
          }
        }}
      />
    </div>
  );
}



export function CollabTopicsChart({ data }) {
  // Enhanced professional color palette for collaboration topics
  const collaborationColors = [
    CHART_GRADIENTS.orange[0],   // Vibrant orange
    CHART_GRADIENTS.amber[0],    // Vibrant amber
    CHART_GRADIENTS.red[0],      // Vibrant red
    CHART_GRADIENTS.purple[0],   // Vibrant purple
    CHART_GRADIENTS.blue[0],     // Vibrant blue
    CHART_GRADIENTS.cyan[0],     // Vibrant cyan
    CHART_GRADIENTS.green[0],    // Vibrant green
    CHART_GRADIENTS.slate[0]     // Professional slate
  ];

  const chartData = {
    ...data,
    datasets: data?.datasets?.map(dataset => ({
      ...dataset,
      backgroundColor: collaborationColors,
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverBorderColor: '#f8fafc',
      hoverOffset: 10,
      borderAlign: 'inner',
      spacing: 3
    })) || []
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1400,
            easing: 'easeOutQuart'
          },
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          plugins: {
            title: {
              display: true,
              text: 'Top Collaboration Topics',
              font: {
                size: 16,
                family: 'Inter, sans-serif',
                weight: '600'
              },
              color: '#1e293b',
              padding: 20
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                font: {
                  size: 12,
                  family: 'Inter, sans-serif',
                  weight: '500'
                },
                padding: 10,
                color: '#1e293b',
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              ...PROFESSIONAL_TOOLTIP,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} topics (${percentage}%)`;
                }
              }
            }
          }
        }}
      />
    </div>
  );
}
