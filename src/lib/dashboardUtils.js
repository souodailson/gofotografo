import { getGreeting } from './dashboard/greetings';
// Import helpers directly as named exports (no default export used)
import {
  getInitialCardConfig,
  getDefaultLayout,
  getTabletLayout,
} from './dashboard/layoutConfig';
import { getDashboardMetrics } from './dashboard/metrics';
import { getChartDataForDashboard } from './dashboard/chartData';

export {
  getGreeting,
  getInitialCardConfig,
  getDefaultLayout,
  getTabletLayout,
  getDashboardMetrics,
  getChartDataForDashboard,
};
