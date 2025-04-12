// File: client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Import components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import TestUpload from './pages/TestUpload';  // Add this new import

// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f8ff',
      100: '#d1e5f7',
      200: '#a7ceef',
      300: '#7db7e7',
      400: '#54a0df',
      500: '#3a89d7',
      600: '#306ac0',
      700: '#284d99',
      800: '#1f3671',
      900: '#121f45',
    },
    seai: {
      primary: '#3a1e6d',
      secondary: '#00813a',
      accent: '#46A09A',
      warning: '#cb6a15',
    },
  },
  fonts: {
    heading: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
      variants: {
        primary: {
          bg: 'seai.primary',
          color: 'white',
          _hover: {
            bg: 'seai.primary',
            opacity: 0.9,
          },
        },
        secondary: {
          bg: 'seai.secondary',
          color: 'white',
          _hover: {
            bg: 'seai.secondary',
            opacity: 0.9,
          },
        },
      },
    },
  },
});

function App() {
  const [dashboardData, setDashboardData] = useState({
    totalAudits: 0,
    totalEmissionsSaved: 0,
    totalEuroSaved: 0,
    organizations: [],
    energyData: [],
    recommendedActions: [],
    reports: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboardData = (newData) => {
    setDashboardData(newData);
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          <Route 
            path="/" 
            element={<Dashboard data={dashboardData} isLoading={isLoading} />} 
          />
          <Route 
            path="/upload" 
            element={<Upload updateDashboard={updateDashboardData} />} 
          />
          <Route 
            path="/reports" 
            element={<Reports reports={dashboardData.reports} isLoading={isLoading} />} 
          />
          {/* Add this new route for test uploads */}
          <Route 
            path="/test-upload" 
            element={<TestUpload />} 
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;