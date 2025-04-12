// File: client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Import components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import TestUpload from './pages/TestUpload'; 

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
    auditConversion: 0,
    totalGrants: 0,
    organizations: [],
    energyData: [],
    recommendedActions: [],
    reports: [],
    applicationStatus: {
      pending: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0,
      total: 0
    },
    auditors: [],
    regions: [],
    industries: []
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
      // If API fails, set some default data for demonstration
      setDashboardData({
        totalAudits: 130,
        totalEmissionsSaved: 578.45,
        totalEuroSaved: 425000,
        auditConversion: 68,
        totalGrants: 185000,
        organizations: ["Tech Solutions Inc.", "EcoFriendly Manufacturing", "Dublin City Council", "Cork Hospital", "Galway University", "Limerick Retail Center"],
        energyData: [
          { type: "Electricity", usage: 250000, cost: 45000, emissions: 120 },
          { type: "Natural Gas", usage: 320000, cost: 32000, emissions: 180 },
          { type: "Oil", usage: 150000, cost: 18000, emissions: 90 }
        ],
        recommendedActions: [
          { name: "Solar PV Installation", energySavings: 75000, costSavings: 12000, emissionsReduction: 35.2, status: "Implemented" },
          { name: "LED Lighting Upgrade", energySavings: 45000, costSavings: 8500, emissionsReduction: 22.5, status: "In Progress" },
          { name: "Heat Pump Replacement", energySavings: 62000, costSavings: 9800, emissionsReduction: 31.0, status: "Pending" },
          { name: "Building Insulation", energySavings: 54000, costSavings: 7200, emissionsReduction: 27.8, status: "Implemented" },
          { name: "Smart Energy Management", energySavings: 38000, costSavings: 6400, emissionsReduction: 19.5, status: "In Progress" }
        ],
        recommendedGrants: [
          { name: "SEAI Commercial Grant", amount: 45000, status: "Applied" },
          { name: "Energy Efficiency Fund", amount: 75000, status: "Eligible" },
          { name: "Green Business Fund", amount: 35000, status: "Recommended" },
          { name: "Renewable Heat Incentive", amount: 28000, status: "Eligible" }
        ],
        reports: [
          {
            fileName: "TechSolutions_Audit_2023.pdf",
            organizationName: "Tech Solutions Inc.",
            uploadDate: "2023-10-15T08:30:00.000Z",
            data: {
              totalCostSavings: 85000,
              totalEmissionsSaved: 120.5,
              emissionsReductionPct: 42,
              implementationStatus: "implemented",
              region: "dublin",
              industry: "technology"
            }
          },
          {
            fileName: "EcoFriendly_EnergyReport.pdf",
            organizationName: "EcoFriendly Manufacturing",
            uploadDate: "2023-11-20T10:45:00.000Z",
            data: {
              totalCostSavings: 105000,
              totalEmissionsSaved: 155.2,
              emissionsReductionPct: 38,
              implementationStatus: "in-progress",
              region: "cork",
              industry: "manufacturing"
            }
          },
          {
            fileName: "DublinCC_Audit.pdf",
            organizationName: "Dublin City Council",
            uploadDate: "2023-12-05T14:20:00.000Z",
            data: {
              totalCostSavings: 78000,
              totalEmissionsSaved: 95.5,
              emissionsReductionPct: 35,
              implementationStatus: "pending",
              region: "dublin",
              industry: "public"
            }
          },
          {
            fileName: "Hospital_Energy_Report.pdf",
            organizationName: "Cork Hospital",
            uploadDate: "2024-01-10T09:15:00.000Z",
            data: {
              totalCostSavings: 92000,
              totalEmissionsSaved: 110.8,
              emissionsReductionPct: 40,
              implementationStatus: "implemented",
              region: "cork",
              industry: "healthcare"
            }
          }
        ],
        applicationStatus: {
          pending: 15,
          inProgress: 28,
          completed: 45,
          rejected: 12,
          total: 100
        },
        auditors: [
          { 
            name: "Emma Thompson", 
            role: "Senior Auditor",
            avatar: "",
            auditsCompleted: 52, 
            conversionRate: 68, 
            avgEnergySavings: 45000, 
            avgCostSavings: 3200 
          },
          { 
            name: "Michael Chen", 
            role: "Energy Consultant",
            avatar: "",
            auditsCompleted: 38, 
            conversionRate: 72, 
            avgEnergySavings: 52000, 
            avgCostSavings: 4100 
          },
          { 
            name: "Sarah Johnson", 
            role: "Audit Specialist",
            avatar: "",
            auditsCompleted: 47, 
            conversionRate: 65, 
            avgEnergySavings: 41000, 
            avgCostSavings: 3500 
          },
          { 
            name: "David Okoro", 
            role: "Technical Advisor",
            avatar: "",
            auditsCompleted: 35, 
            conversionRate: 70, 
            avgEnergySavings: 47000, 
            avgCostSavings: 3800 
          }
        ],
        regions: ["Dublin", "Cork", "Galway", "Limerick"],
        industries: ["Manufacturing", "Commercial", "Healthcare", "Education", "Hospitality", "Technology"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboardData = (newData) => {
    setDashboardData(prevData => ({
      ...prevData,
      ...newData
    }));
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