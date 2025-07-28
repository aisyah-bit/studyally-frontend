import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";
import AdminLayout from "./AdminLayout";
import { sortByCreatedAt } from "./utils/dateUtils";
import {
  AdminUserGrowthChart,
  AdminGroupAnalyticsChart,
  AdminActivityChart,
  AdminEngagementChart
} from "./components/AdminAnalyticsCharts";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalUsers: 0,
    activeGroups: 0,
    popularSubject: "Loading...",
    recentGroups: [],
    todayGroups: 0,
    weekGroups: 0,
    monthGroups: 0,
    recentRegistrations: 0,
    activeUsers: 0,
    groupGrowthRate: 0,
    userGrowthRate: 0,
    averageGroupSize: 0,
    completionRate: 0,
    // Enhanced analytics data
    userGrowthData: [],
    groupCreationData: [],
    subjectDistribution: [],
    activityTrends: [],
    engagementMetrics: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      averageSessionTime: 0
    },
    platformHealth: {
      successfulGroups: 0,
      cancelledGroups: 0,
      userRetentionRate: 0,
      platformUtilization: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to generate growth data for charts
  const generateGrowthData = (data, days) => {
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = data.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= date && itemDate < nextDate;
      }).length;

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }

    return result;
  };

  // Helper function to calculate subject distribution
  const calculateSubjectDistribution = (groups) => {
    const subjects = {};
    groups.forEach(group => {
      const subject = group.studySubject || 'Other';
      subjects[subject] = (subjects[subject] || 0) + 1;
    });

    return Object.entries(subjects)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 subjects
  };

  // Helper function to generate activity trends
  const generateActivityTrends = (groups, users) => {
    const trends = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const groupsCreated = groups.filter(group => {
        if (!group.createdAt) return false;
        const groupDate = new Date(group.createdAt);
        return groupDate >= date && groupDate < nextDate;
      }).length;

      const usersJoined = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate >= date && userDate < nextDate;
      }).length;

      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        groups: groupsCreated,
        users: usersJoined
      });
    }

    return trends;
  };

  // Helper function to calculate engagement metrics
  const calculateEngagementMetrics = (users) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyActiveUsers = users.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) >= oneDayAgo;
    }).length;

    const weeklyActiveUsers = users.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) >= oneWeekAgo;
    }).length;

    const monthlyActiveUsers = users.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) >= oneMonthAgo;
    }).length;

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      averageSessionTime: 0 // Placeholder - would need session tracking
    };
  };

  // Helper function to calculate platform health metrics
  const calculatePlatformHealth = (groups, users) => {
    const successfulGroups = groups.filter(group => {
      const joinedCount = Array.isArray(group.joinedList) ? group.joinedList.length : 0;
      const totalMembers = joinedCount + 1;
      const groupSize = parseInt(group.groupSize) || 0;
      return totalMembers >= groupSize;
    }).length;

    const cancelledGroups = 0; // Placeholder - would need cancellation tracking

    const userRetentionRate = users.length > 0 ?
      Math.round((users.filter(user => user.lastLogin).length / users.length) * 100) : 0;

    const platformUtilization = groups.length > 0 ?
      Math.round((successfulGroups / groups.length) * 100) : 0;

    return {
      successfulGroups,
      cancelledGroups,
      userRetentionRate,
      platformUtilization
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch study groups
      const groupsSnapshot = await getDocs(collection(db, "studyGroups"));
      const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const totalGroups = groups.length;
      const totalUsers = users.length;
      const activeGroups = groups.filter(group => {
        const joinedCount = Array.isArray(group.joinedList) ? group.joinedList.length : 0;
        // Total members = creator (1) + joined members
        const totalMembers = joinedCount + 1;
        const groupSize = parseInt(group.groupSize) || 0;
        return totalMembers < groupSize; // Group is active if it has space for more members
      }).length;

      // Find most popular subject
      const subjectCounts = {};
      groups.forEach(group => {
        const subject = group.studySubject || "Unknown";
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
      const popularSubject = Object.keys(subjectCounts).reduce((a, b) => 
        subjectCounts[a] > subjectCounts[b] ? a : b, "No data"
      );

      // Get recent groups (last 5) - properly sorted by creation date
      const recentGroups = sortByCreatedAt(groups, 'desc').slice(0, 5);

      // Calculate creation date statistics
      const now = new Date();
      const todayGroups = groups.filter(group => {
        if (!group.createdAt) return false;
        const groupDate = new Date(group.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return groupDate >= today;
      }).length;

      const weekGroups = groups.filter(group => {
        if (!group.createdAt) return false;
        const groupDate = new Date(group.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return groupDate >= weekAgo;
      }).length;

      const monthGroups = groups.filter(group => {
        if (!group.createdAt) return false;
        const groupDate = new Date(group.createdAt);
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return groupDate >= monthAgo;
      }).length;

      // Calculate user metrics
      const recentRegistrations = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return userDate >= weekAgo;
      }).length;

      const activeUsers = users.filter(user => {
        if (!user.lastLogin) return false;
        const lastLogin = new Date(user.lastLogin);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return lastLogin >= weekAgo;
      }).length;

      // Calculate growth rates
      const lastWeekGroups = groups.filter(group => {
        if (!group.createdAt) return false;
        const groupDate = new Date(group.createdAt);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(now.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return groupDate >= twoWeeksAgo && groupDate < weekAgo;
      }).length;

      const groupGrowthRate = lastWeekGroups > 0 ?
        Math.round(((weekGroups - lastWeekGroups) / lastWeekGroups) * 100) :
        weekGroups > 0 ? 100 : 0;

      // Calculate average group size
      const totalMembers = groups.reduce((sum, group) => {
        const joinedCount = Array.isArray(group.joinedList) ? group.joinedList.length : 0;
        return sum + joinedCount + 1; // +1 for creator
      }, 0);
      const averageGroupSize = totalGroups > 0 ? Math.round((totalMembers / totalGroups) * 10) / 10 : 0;

      // Calculate completion rate (groups that are full)
      const fullGroups = groups.filter(group => {
        const joinedCount = Array.isArray(group.joinedList) ? group.joinedList.length : 0;
        const totalMembers = joinedCount + 1;
        const groupSize = parseInt(group.groupSize) || 0;
        return totalMembers >= groupSize;
      }).length;
      const completionRate = totalGroups > 0 ? Math.round((fullGroups / totalGroups) * 100) : 0;

      // Generate user growth data for the last 7 days
      const userGrowthData = generateGrowthData(users, 7);

      // Generate group creation data for the last 7 days
      const groupCreationData = generateGrowthData(groups, 7);

      // Calculate subject distribution
      const subjectDistribution = calculateSubjectDistribution(groups);

      // Generate activity trends
      const activityTrends = generateActivityTrends(groups, users);

      // Calculate engagement metrics
      const engagementMetrics = calculateEngagementMetrics(users);

      // Calculate platform health metrics
      const platformHealth = calculatePlatformHealth(groups, users);

      setStats({
        totalGroups,
        totalUsers,
        activeGroups,
        popularSubject,
        recentGroups,
        todayGroups,
        weekGroups,
        monthGroups,
        recentRegistrations,
        activeUsers,
        groupGrowthRate,
        userGrowthRate: recentRegistrations,
        averageGroupSize,
        completionRate,
        userGrowthData,
        groupCreationData,
        subjectDistribution,
        activityTrends,
        engagementMetrics,
        platformHealth
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the StudyAlly administration panel</p>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="admin-analytics-section">
            {/* User Growth Chart - Top Left */}
            <div className="admin-chart-card admin-user-growth">
              <AdminUserGrowthChart
                data={stats.userGrowthData}
                totalUsers={stats.totalUsers}
                growthRate={stats.userGrowthRate}
              />
            </div>

            {/* Group Analytics Chart - Top Right */}
            <div className="admin-chart-card admin-group-analytics">
              <AdminGroupAnalyticsChart
                data={stats.groupCreationData}
                subjectDistribution={stats.subjectDistribution}
                totalGroups={stats.totalGroups}
                completionRate={stats.completionRate}
              />
            </div>

            {/* Activity Trends Chart - Bottom Left */}
            <div className="admin-chart-card admin-activity-trends">
              <AdminActivityChart
                data={stats.activityTrends}
                activeGroups={stats.activeGroups}
                activeUsers={stats.activeUsers}
              />
            </div>

            {/* Engagement Metrics Chart - Bottom Right */}
            <div className="admin-chart-card admin-engagement-metrics">
              <AdminEngagementChart
                engagementMetrics={stats.engagementMetrics}
                platformHealth={stats.platformHealth}
                averageGroupSize={stats.averageGroupSize}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
