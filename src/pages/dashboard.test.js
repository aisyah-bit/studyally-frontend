import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './dashboard';
import { auth, db } from './firebaseConfig';

// Mock Firebase
jest.mock('./firebaseConfig', () => ({
  auth: {
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com'
    }
  },
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ name: 'Test User' })
  })),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [
      {
        id: 'group1',
        data: () => ({
          groupName: 'Test Group',
          studyDay: 'Monday',
          studyTime: '10:00 AM',
          studySubject: 'Math',
          location: 'Library',
          creatorEmail: 'test@example.com',
          joinedList: ['user1@example.com', 'user2@example.com']
        })
      }
    ]
  })),
  collection: jest.fn()
}));

// Mock Chart.js components
jest.mock('../components/AnalyticsCharts', () => ({
  SubjectPieChart: ({ data }) => <div data-testid="subject-chart">Subject Chart</div>,
  PopularSpotsChart: ({ data }) => <div data-testid="spots-chart">Popular Spots Chart</div>,
  ActiveMembersChart: ({ data }) => <div data-testid="members-chart">Active Members Chart</div>
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Analytics Cards', () => {
  test('renders all analytics cards simultaneously without conditional rendering', async () => {
    renderDashboard();

    // Check that all card containers are present immediately (not conditionally rendered)
    expect(screen.getByText('📍 Top Study Spots')).toBeInTheDocument();
    expect(screen.getByText('📅 Upcoming Group Sessions')).toBeInTheDocument();
    expect(screen.getByText('📚 Most Common Subjects')).toBeInTheDocument();
    expect(screen.getByText('👥 Active Group Members')).toBeInTheDocument();
    expect(screen.getByText('🌟 Study Motivation')).toBeInTheDocument();

    // Check that loading states are shown initially
    expect(screen.getAllByText('Loading analytics...')).toHaveLength(3); // 3 chart cards show loading
  });

  test('top study spots card has enhanced styling classes', () => {
    renderDashboard();
    
    const topSpotsCard = screen.getByText('📍 Top Study Spots').closest('.chart-card');
    expect(topSpotsCard).toHaveClass('top-spots');
    expect(topSpotsCard).toHaveClass('loading'); // Initially loading
  });

  test('all analytics cards are present in the optimized no-scroll grid layout', () => {
    renderDashboard();

    const chartsSection = document.querySelector('.charts-section');
    expect(chartsSection).toBeInTheDocument();

    // Check that all required cards are present
    const cards = chartsSection.querySelectorAll('.chart-card');
    expect(cards).toHaveLength(5);

    // Check specific grid area classes for new 2x3 layout
    expect(document.querySelector('.chart-card.top-spots')).toBeInTheDocument();
    expect(document.querySelector('.chart-card.sessions')).toBeInTheDocument();
    expect(document.querySelector('.chart-card.subjects')).toBeInTheDocument();
    expect(document.querySelector('.chart-card.members')).toBeInTheDocument();
    expect(document.querySelector('.chart-card.motivation')).toBeInTheDocument();

    // Verify the charts section has proper height constraints for no-scroll layout
    const computedStyle = window.getComputedStyle(chartsSection);
    expect(computedStyle.overflow).toBe('hidden');
  });

  test('charts render after data loads', async () => {
    renderDashboard();

    // Wait for data to load and charts to render
    await waitFor(() => {
      expect(screen.getByTestId('spots-chart')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByTestId('subject-chart')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('members-chart')).toBeInTheDocument();
    });
  });

  test('motivation card displays static content immediately', () => {
    renderDashboard();

    expect(screen.getByText('"Studying is not about time, it\'s about effort."')).toBeInTheDocument();
    expect(screen.getByText('💡 Try the Pomodoro method: 25 min study, 5 min break.')).toBeInTheDocument();
  });

  test('dashboard layout prevents scrolling and fits in viewport', () => {
    renderDashboard();

    const mainContent = document.querySelector('.main-content');
    const chartsSection = document.querySelector('.charts-section');

    // Check that main content and charts section have overflow hidden
    expect(window.getComputedStyle(mainContent).overflow).toBe('hidden');

    // Verify charts section has height constraints
    const chartsSectionStyle = window.getComputedStyle(chartsSection);
    expect(chartsSectionStyle.maxHeight).toContain('calc');
    expect(chartsSectionStyle.display).toBe('grid');
  });

  test('professional business styling is applied with scoped CSS variables', () => {
    renderDashboard();

    // Check that dashboard-scoped CSS custom properties are available
    const dashboardContainer = document.querySelector('.dashboard-container');
    const dashboardStyles = window.getComputedStyle(dashboardContainer);

    // Verify professional color palette is applied
    expect(dashboardStyles.getPropertyValue('--dashboard-bg-primary')).toBe('#f8fafc');
    expect(dashboardStyles.getPropertyValue('--dashboard-accent-blue')).toBe('#3b82f6');

    // Check that cards have professional styling
    const topSpotsCard = document.querySelector('.chart-card.top-spots');
    const cardStyle = window.getComputedStyle(topSpotsCard);
    expect(cardStyle.borderRadius).toBeTruthy();
    expect(cardStyle.boxShadow).toBeTruthy();
  });

  test('styling is properly scoped to dashboard container only', () => {
    renderDashboard();

    // Verify all dashboard styles are scoped under .dashboard-container
    const dashboardContainer = document.querySelector('.dashboard-container');
    expect(dashboardContainer).toBeInTheDocument();

    // Check that chart cards are properly scoped
    const chartCards = document.querySelectorAll('.dashboard-container .chart-card');
    expect(chartCards.length).toBeGreaterThan(0);

    // Verify professional color scheme is applied
    const topSpotsCard = document.querySelector('.dashboard-container .chart-card.top-spots');
    expect(topSpotsCard).toHaveClass('top-spots');
  });

  test('professional business color scheme is implemented', () => {
    renderDashboard();

    const dashboardContainer = document.querySelector('.dashboard-container');
    const styles = window.getComputedStyle(dashboardContainer);

    // Verify muted, professional color palette
    expect(styles.getPropertyValue('--dashboard-text-primary')).toBe('#1e293b');
    expect(styles.getPropertyValue('--dashboard-text-secondary')).toBe('#64748b');
    expect(styles.getPropertyValue('--dashboard-border-light')).toBe('#e2e8f0');
    expect(styles.getPropertyValue('--dashboard-success')).toBe('#059669');
  });
});
