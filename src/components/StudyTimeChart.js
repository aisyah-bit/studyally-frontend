// components/StudyTimeChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StudyTimeChart({ data }) {
  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false, // ✅ allows height to expand
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 14 // ✅ larger legend font
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false,
              font: {
                size: 12 // ✅ larger x-label font
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 12 // ✅ larger y-label font
              }
            },
            beginAtZero: true
          }
        }
      }}
    />
  );
}
