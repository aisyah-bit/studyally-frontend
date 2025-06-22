// ✅ AnalyticsCharts.js
import React from 'react';
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

export function PeakStudyHourChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;
  return (
    <div style={{ height: '300px' }}>
      <Bar 
        data={data} 
        options={{ 
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            title: { 
              display: true, 
              text: 'Peak Study Hours', 
              font: { size: 16 } 
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY,
              ticks: {
                stepSize: 1
              },
              grid: {
                color: '#e5e7eb'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }} 
      />
    </div>
  );
}

export function SubjectPieChart({ data }) {
  return (
    <div style={{ height: '300px' }}>
      <Pie 
        data={data} 
        options={{ 
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            title: { 
              display: true, 
              text: 'Most Common Subjects', 
              font: { size: 16 } 
            }
          }
        }} 
      />
    </div>
  );
}

export function WeeklyGrowthChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;
  return (
    <div style={{ height: '300px' }}>
      <Line 
        data={data} 
        options={{ 
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            title: { 
              display: true, 
              text: 'Study Group Growth This Week', 
              font: { size: 16 } 
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY,
              ticks: {
                stepSize: 1
              }
            }
          }
        }} 
      />
    </div>
  );
}

export function PopularSpotsChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;
  return (
    <div style={{ height: '300px' }}>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Popular Study Spots',
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY,
              ticks: { stepSize: 1 }
            }
          }
        }}
      />
    </div>
  );
}

export function ActiveMembersChart({ data }) {
  const maxY = data?.datasets?.[0]?.data?.length ? Math.max(...data.datasets[0].data, 5) : 5;
  return (
    <div style={{ height: '300px' }}>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Active Group Members',
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxY,
              ticks: { stepSize: 1 }
            }
          }
        }}
      />
    </div>
  );
}

export function CollabTopicsChart({ data }) {
  return (
    <div style={{ height: '300px' }}>
      <Pie
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Top Collaboration Topics',
              font: { size: 16 }
            }
          }
        }}
      />
    </div>
  );
}

