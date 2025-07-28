// ✅ Dashboard.js (Updated to use Layout Component)
import { useState, useEffect } from "react";
import { auth, db } from "../pages/firebaseConfig";
import { getDocs, collection } from "firebase/firestore";
import Layout from "../components/layout";
import {
  SubjectPieChart,
  PopularSpotsChart,
  ActiveMembersChart,
} from "../components/AnalyticsCharts";
import "./dashboard.css";

export default function Dashboard() {

  const [subjectChartData, setSubjectChartData] = useState(null);
  const [popularSpotsData, setPopularSpotsData] = useState(null);
  const [activeMembersData, setActiveMembersData] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Dynamic motivation state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isQuoteFading, setIsQuoteFading] = useState(false);
  const [isTipFading, setIsTipFading] = useState(false);



  // Loading component for charts - optimized for compact layout
  const LoadingChart = () => (
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p style={{ fontSize: '0.9rem', margin: 0 }}>Loading...</p>
    </div>
  );

  // Dynamic motivation content arrays
  const motivationalQuotes = [
    "Success is the sum of small efforts repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Education is the most powerful weapon which you can use to change the world.",
    "Learning never exhausts the mind.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Study hard, for the well is deep, and our brains are shallow.",
    "Knowledge is power. Information is liberating.",
    "The more that you read, the more things you will know.",
    "Continuous effort - not strength or intelligence - is the key to unlocking potential.",
    "Excellence is never an accident. It is always the result of high intention and intelligent effort."
  ];

  const studyTechniques = [
    "Try the Pomodoro Technique: 25 minutes focused study, 5 minute break.",
    "Use active recall: Test yourself instead of just re-reading notes.",
    "Practice spaced repetition: Review material at increasing intervals.",
    "Create mind maps to visualize connections between concepts.",
    "Teach someone else - it's the best way to test your understanding.",
    "Use the Feynman Technique: Explain concepts in simple terms.",
    "Take handwritten notes to improve retention and comprehension.",
    "Study in different locations to strengthen memory associations.",
    "Break large topics into smaller, manageable chunks.",
    "Use mnemonics and memory palaces for complex information."
  ];



  useEffect(() => {
    const fetchUserAnalytics = async () => {
      setIsLoadingAnalytics(true);
      const user = auth.currentUser;
      const studySpotMap = {};
      const groupMemberMap = {};
      const subjectMap = {};
      if (!user) {
        setIsLoadingAnalytics(false);
        return;
      }

      const groupSnap = await getDocs(collection(db, "studyGroups"));
      const upcomingList = [];

      for (const groupDoc of groupSnap.docs) {
        const data = groupDoc.data();
        const isInGroup = data.creatorEmail === user.email || (data.joinedList || []).includes(user.email);

        if (isInGroup) {
          const sessionDay = data.studyDay;
          const sessionTime = data.studyTime;
          const groupName = data.groupName || "Unnamed Group";

          if (sessionDay && sessionTime) {
            upcomingList.push({ groupName, day: sessionDay, time: sessionTime });

            const subj = data.studySubject || "Unknown";
            subjectMap[subj] = (subjectMap[subj] || 0) + 1;

            const groupNameKey = data.groupName || "Unnamed Group";
            const memberCount = (data.joinedList || []).length;
            groupMemberMap[groupNameKey] = memberCount;
          }
        }

        const spot = data.location || "Unknown Spot";
        studySpotMap[spot] = (studySpotMap[spot] || 0) + 1;
      }

      const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      upcomingList.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
      setUpcomingSessions(upcomingList);

      setSubjectChartData({
        labels: Object.keys(subjectMap),
        datasets: [{
          label: 'Study Groups',
          data: Object.values(subjectMap),
          backgroundColor: ['#3b82f6', '#64748b', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626']
        }]
      });

      const reviewsSnap = await getDocs(collection(db, "reviews"));
      const spotRatings = [];

      for (const spotDoc of reviewsSnap.docs) {
        const spotId = spotDoc.id;
        const userReviewsSnap = await getDocs(collection(db, `reviews/${spotId}/userReviews`));

        let totalRating = 0;
        let count = 0;
        let spotName = spotId;

        userReviewsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.rating) {
            totalRating += data.rating;
            count++;
          }
          if (data.spotName) {
            spotName = data.spotName;
          }
        });

        if (count > 0) {
          const average = totalRating / count;
          spotRatings.push({ spotName, average });
        }
      }

      const top5RatedSpots = spotRatings.sort((a, b) => b.average - a.average).slice(0, 5);
      setPopularSpotsData({
        labels: top5RatedSpots.map((s) => s.spotName),
        datasets: [{
          label: "Average Rating",
          data: top5RatedSpots.map((s) => s.average.toFixed(2)),
          backgroundColor: "#3b82f6"
        }]
      });

      const sortedMembers = Object.entries(groupMemberMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
      setActiveMembersData({
        labels: sortedMembers.map(([groupName]) => groupName),
        datasets: [{
          label: 'Members',
          data: sortedMembers.map(([_, count]) => count),
          backgroundColor: '#059669'
        }]
      });

      setIsLoadingAnalytics(false);
    };

    fetchUserAnalytics();
  }, []);

  // Dynamic motivation rotation effect
  useEffect(() => {
    const rotateContent = () => {
      // Rotate quotes every 5 seconds
      const quoteInterval = setInterval(() => {
        setIsQuoteFading(true);
        setTimeout(() => {
          setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
          setIsQuoteFading(false);
        }, 300); // Fade duration
      }, 5000);

      // Rotate tips every 5 seconds (offset by 2.5 seconds)
      const tipInterval = setInterval(() => {
        setIsTipFading(true);
        setTimeout(() => {
          setCurrentTipIndex((prev) => (prev + 1) % studyTechniques.length);
          setIsTipFading(false);
        }, 300); // Fade duration
      }, 5000);

      // Offset tip rotation by 2.5 seconds
      const offsetTipInterval = setTimeout(() => {
        setIsTipFading(true);
        setTimeout(() => {
          setCurrentTipIndex((prev) => (prev + 1) % studyTechniques.length);
          setIsTipFading(false);
        }, 300);
      }, 2500);

      return () => {
        clearInterval(quoteInterval);
        clearInterval(tipInterval);
        clearTimeout(offsetTipInterval);
      };
    };

    const cleanup = rotateContent();
    return cleanup;
  }, [motivationalQuotes.length, studyTechniques.length]);

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="charts-section">
            {/* Most Common Subjects */}
            <div className={`chart-card subjects ${isLoadingAnalytics ? 'loading' : ''}`}>
              <h3 className="chart-title">
                Subject Distribution Analysis
              </h3>
              {subjectChartData ? (
                <SubjectPieChart data={subjectChartData} />
              ) : (
                <LoadingChart />
              )}
            </div>

            {/* Upcoming Group Sessions */}
            <div className="chart-card sessions">
              <h3 className="chart-title">
                Scheduled Study Sessions
              </h3>
              {upcomingSessions.length > 0 ? (
                <div className="session-list-grid">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="session-card">
                      <div className="session-header">
                        <span className="session-day">{session.day}</span>
                        <span className="session-time">@ {session.time}</span>
                      </div>
                      <div className="session-group">{session.groupName}</div>
                    </div>
                  ))}
                </div>
              ) : isLoadingAnalytics ? (
                <LoadingChart />
              ) : (
                <p style={{ color: "#888", fontStyle: "italic", padding: "1rem" }}>
                  No upcoming sessions found.
                </p>
              )}
            </div>

            {/* Top Study Spots - Most Prominent Card */}
            <div className={`chart-card top-spots ${isLoadingAnalytics ? 'loading' : ''}`}>
              <h3 className="chart-title">
                Popular Study Locations
              </h3>
              {popularSpotsData ? (
                <PopularSpotsChart data={popularSpotsData} />
              ) : (
                <LoadingChart />
              )}
            </div>

            {/* Active Group Members */}
            <div className={`chart-card members ${isLoadingAnalytics ? 'loading' : ''}`}>
              <h3 className="chart-title">
                Member Engagement Metrics
              </h3>
              {activeMembersData ? (
                <ActiveMembersChart data={activeMembersData} />
              ) : (
                <LoadingChart />
              )}
            </div>

            {/* Study Motivation */}
            <div className="chart-card motivation">
              <h3 className="chart-title">
                Study Insights & Motivation
              </h3>
              <p className={`study-quote ${isQuoteFading ? 'fading' : ''}`}>“{motivationalQuotes[currentQuoteIndex]}”</p>
              <p className={`study-technique ${isTipFading ? 'fading' : ''}`}>
                {studyTechniques[currentTipIndex]}
              </p>
            </div>
        </div>
      </div>
    </Layout>
  );
}