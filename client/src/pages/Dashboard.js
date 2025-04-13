import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Text,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  HStack,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Avatar,
  Select,
  Button,
  Icon,
  InputGroup,
  Input,
  InputRightElement
} from '@chakra-ui/react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { FiArrowDown, FiArrowUp, FiFilter, FiChevronDown, FiDownload, FiCheckCircle } from 'react-icons/fi';

const StatCard = ({ label, value, helpText, color }) => (
  <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
    <Stat>
      <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
      <StatNumber fontSize="2xl" fontWeight="bold" color={color}>{value}</StatNumber>
      {helpText && <StatHelpText>{helpText}</StatHelpText>}
    </Stat>
  </Box>
);

const SectionHeading = ({ children, actionBtn }) => (
  <Flex justify="space-between" align="center" mb={4}>
    <Heading size="md" color="seai.primary">
      {children}
    </Heading>
    {actionBtn}
  </Flex>
);

export default function Dashboard({ data, isLoading }) {
  // State for filters
  const [region, setRegion] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [year, setYear] = useState('all');
  
  // Filter data based on selected filters
  const filterData = (items, hasOrgField = true) => {
    if (!items || items.length === 0) return [];
    
    return items.filter(item => {
      let passesRegionFilter = true;
      let passesIndustryFilter = true;
      let passesYearFilter = true;
      
      if (hasOrgField) {
        // For items linked to organizations like energyData or recommendedActions
        const org = item.organization;
        const report = data.reports.find(r => r.organizationName === org);
        
        if (region !== 'all' && report?.data?.region) {
          passesRegionFilter = report.data.region.toLowerCase() === region.toLowerCase();
        }
        
        if (industry !== 'all' && report?.data?.industry) {
          passesIndustryFilter = report.data.industry.toLowerCase() === industry.toLowerCase();
        }
        
        if (year !== 'all' && report?.uploadDate) {
          const reportYear = new Date(report.uploadDate).getFullYear().toString();
          passesYearFilter = reportYear === year;
        }
      } else {
        // For report items directly
        if (region !== 'all' && item.data?.region) {
          passesRegionFilter = item.data.region.toLowerCase() === region.toLowerCase();
        }
        
        if (industry !== 'all' && item.data?.industry) {
          passesIndustryFilter = item.data.industry.toLowerCase() === industry.toLowerCase();
        }
        
        if (year !== 'all' && item.uploadDate) {
          const reportYear = new Date(item.uploadDate).getFullYear().toString();
          passesYearFilter = reportYear === year;
        }
      }
      
      return passesRegionFilter && passesIndustryFilter && passesYearFilter;
    });
  };
  
  // Filtered reports
  const filteredReports = React.useMemo(() => {
    return filterData(data.reports || [], false);
  }, [data.reports, region, industry, year]);
  
  // Filtered organizations
  const filteredOrganizations = React.useMemo(() => {
    if (!filteredReports.length) return [];
    
    return [...new Set(filteredReports.map(report => report.organizationName))];
  }, [filteredReports]);
  
  // Filtered energy data
  const filteredEnergyData = React.useMemo(() => {
    if (!data.energyData) return [];
    
    if (region === 'all' && industry === 'all' && year === 'all') {
      return data.energyData;
    }
    
    return data.energyData.filter(item => {
      const org = item.organization;
      return filteredOrganizations.includes(org);
    });
  }, [data.energyData, filteredOrganizations, region, industry, year]);
  
  // Filtered recommended actions
  const filteredRecommendedActions = React.useMemo(() => {
    if (!data.recommendedActions) return [];
    
    if (region === 'all' && industry === 'all' && year === 'all') {
      return data.recommendedActions;
    }
    
    return data.recommendedActions.filter(item => {
      const org = item.organization;
      return filteredOrganizations.includes(org);
    });
  }, [data.recommendedActions, filteredOrganizations, region, industry, year]);
  
  // Calculate filtered metrics
  const filteredMetrics = React.useMemo(() => {
    let totalAudits = filteredReports.length;
    let totalEmissionsSaved = 0;
    let totalEuroSaved = 0;
    
    filteredReports.forEach(report => {
      if (report.data) {
        totalEmissionsSaved += report.data.totalEmissionsSaved || 0;
        totalEuroSaved += report.data.totalCostSavings || 0;
      }
    });
    
    return {
      totalAudits,
      totalEmissionsSaved,
      totalEuroSaved
    };
  }, [filteredReports]);
  
  // Process data for charts with fallback data for empty state
  const energyTypeDistribution = React.useMemo(() => {
    if (!filteredEnergyData || filteredEnergyData.length === 0) {
      console.log("No energy data available, using fallback data");
      return [
        { name: 'Electricity', value: 0 },
        { name: 'Natural Gas', value: 0 },
        { name: 'Oil', value: 0 }
      ];
    }
    
    console.log("Processing energy data for visualization");
    const energyTypes = {};
    filteredEnergyData.forEach(item => {
      if (!energyTypes[item.type]) {
        energyTypes[item.type] = 0;
      }
      energyTypes[item.type] += item.usage || 0;
    });
    
    return Object.keys(energyTypes).map(type => ({
      name: type,
      value: energyTypes[type]
    }));
  }, [filteredEnergyData]);
  
  const recommendedActionTypes = React.useMemo(() => {
    if (!filteredRecommendedActions || filteredRecommendedActions.length === 0) {
      console.log("No recommended actions available, using fallback data");
      return [
        { name: 'Solar PV', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 },
        { name: 'LED Lighting', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 },
        { name: 'Heat Pump', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 }
      ];
    }
    
    console.log("Processing recommended actions for visualization");
    const actionTypes = {};
    filteredRecommendedActions.forEach(item => {
      if (!actionTypes[item.name]) {
        actionTypes[item.name] = {
          count: 0,
          energySavings: 0,
          costSavings: 0,
          emissionsReduction: 0
        };
      }
      actionTypes[item.name].count += 1;
      actionTypes[item.name].energySavings += item.energySavings || 0;
      actionTypes[item.name].costSavings += item.costSavings || 0;
      actionTypes[item.name].emissionsReduction += item.emissionsReduction || 0;
    });
    
    return Object.keys(actionTypes).map(name => ({
      name,
      ...actionTypes[name]
    }));
  }, [filteredRecommendedActions]);
  
  // Monthly energy usage data (placeholder or derived from real data)
  const monthlyEnergyUsage = React.useMemo(() => {
    // If we had actual monthly data, we would filter it here
    // For now, providing placeholder data
    return [
      { month: 'Jan', electricity: 35, heating: 45 },
      { month: 'Feb', electricity: 30, heating: 40 },
      { month: 'Mar', electricity: 25, heating: 30 },
      { month: 'Apr', electricity: 22, heating: 20 },
      { month: 'May', electricity: 20, heating: 10 },
      { month: 'Jun', electricity: 25, heating: 5 },
      { month: 'Jul', electricity: 30, heating: 3 },
      { month: 'Aug', electricity: 35, heating: 5 },
      { month: 'Sep', electricity: 25, heating: 10 },
      { month: 'Oct', electricity: 20, heating: 20 },
      { month: 'Nov', electricity: 25, heating: 30 },
      { month: 'Dec', electricity: 30, heating: 40 }
    ];
  }, []);
  
  // Application status data - filtered based on implementation status
  const applicationStatus = React.useMemo(() => {
    const pending = filteredReports.filter(r => r.data?.implementationStatus === 'pending').length;
    const inProgress = filteredReports.filter(r => r.data?.implementationStatus === 'in-progress').length;
    const completed = filteredReports.filter(r => r.data?.implementationStatus === 'implemented').length;
    const rejected = 0; // Assuming no rejected status for now
    const total = filteredReports.length;
    
    return {
      pending: pending || 0,
      inProgress: inProgress || 0,
      completed: completed || 0,
      rejected: rejected || 0,
      total: total || 1 // Avoid division by zero
    };
  }, [filteredReports]);
  
  // Energy consumption breakdown data
  const energyConsumptionBreakdown = React.useMemo(() => {
    // Would be filtered based on selected filters if real data
    return [
      { month: 'Jan', residential: 120, commercial: 230, industrial: 450 },
      { month: 'Feb', residential: 130, commercial: 240, industrial: 430 },
      { month: 'Mar', residential: 140, commercial: 250, industrial: 410 },
      { month: 'Apr', residential: 150, commercial: 260, industrial: 420 },
      { month: 'May', residential: 160, commercial: 270, industrial: 400 },
      { month: 'Jun', residential: 170, commercial: 280, industrial: 390 }
    ];
  }, []);
  
  // Recommended grants data - would be filtered if real data
  const recommendedGrants = React.useMemo(() => {
    return (data.recommendedGrants || []).filter(grant => {
      if (region === 'all' && industry === 'all' && year === 'all') {
        return true;
      }
      
      const org = grant.organization;
      return filteredOrganizations.includes(org);
    });
  }, [data.recommendedGrants, filteredOrganizations, region, industry, year]);
  
  // Auditor performance data - would be filtered if real data
  const auditorPerformance = React.useMemo(() => {
    // In a real app, we'd filter the auditor data based on the selected filters
    const auditors = data.auditors || [
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
    ];
    
    // Sort by conversion rate (descending)
    return [...auditors].sort((a, b) => b.conversionRate - a.conversionRate);
  }, [data.auditors]);
  
  // Calculate totals and averages
  const metrics = React.useMemo(() => {
    let avgSavingsPerAudit = 0;
    let avgEmissionsPerAudit = 0;
    let auditConversion = 0;
    let totalGrants = 0;
    let completionRate = 0;
    let totalRecommendedGrants = 0;
    
    if (filteredReports.length > 0) {
      const implementedReports = filteredReports.filter(r => r.data?.implementationStatus === 'implemented');
      auditConversion = Math.round((implementedReports.length / filteredReports.length) * 100);
      
      if (filteredMetrics.totalAudits > 0) {
        avgSavingsPerAudit = filteredMetrics.totalEuroSaved / filteredMetrics.totalAudits;
        avgEmissionsPerAudit = filteredMetrics.totalEmissionsSaved / filteredMetrics.totalAudits;
      }
      
      totalGrants = filteredReports.reduce((sum, report) => sum + (report.data?.grantAmount || 0), 0);
      completionRate = Math.round((applicationStatus.completed / applicationStatus.total) * 100);
      totalRecommendedGrants = recommendedGrants.reduce((sum, grant) => sum + (grant.amount || 0), 0);
    } else {
      // Default values if no reports match the filters
      auditConversion = data.auditConversion || 0;
      totalGrants = data.totalGrants || 0;
      completionRate = applicationStatus.completed > 0 ? Math.round((applicationStatus.completed / applicationStatus.total) * 100) : 0;
      totalRecommendedGrants = recommendedGrants.reduce((sum, grant) => sum + (grant.amount || 0), 0);
    }
    
    return {
      avgSavingsPerAudit,
      avgEmissionsPerAudit,
      auditConversion,
      totalGrants,
      completionRate,
      totalRecommendedGrants
    };
  }, [filteredReports, filteredMetrics, applicationStatus, recommendedGrants, data]);
  
  const COLORS = ['#3a1e6d', '#00813a', '#46A09A', '#cb6a15', '#6e1560', '#9B2C2C'];

  // Check for no data condition
  const hasNoData = !filteredReports || filteredReports.length === 0;

  // Get available years from reports
  const availableYears = React.useMemo(() => {
    if (!data.reports || data.reports.length === 0) return ['2022', '2023', '2024', '2025'];
    
    const years = data.reports
      .map(report => new Date(report.uploadDate).getFullYear())
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => b - a); // Sort descending
      
    return years.map(year => year.toString());
  }, [data.reports]);

  // Reset filters
  const handleResetFilters = () => {
    setRegion('all');
    setIndustry('all');
    setYear('all');
  };

  if (isLoading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="seai.primary" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>WattNext Energy Audit Dashboard</Heading>
      
      {/* Filter Bar */}
      <Flex mb={6} wrap="wrap" gap={3} align="center">
        <Text fontWeight="medium" mr={2}>Filter by:</Text>
        <Select 
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
          w="150px" 
          size="sm"
          placeholder="Region"
          icon={<FiChevronDown />}
          bg="white"
        >
          <option value="all">All Regions</option>
          <option value="dublin">Dublin</option>
          <option value="cork">Cork</option>
          <option value="galway">Galway</option>
          <option value="limerick">Limerick</option>
        </Select>
        
        <Select 
          value={industry} 
          onChange={(e) => setIndustry(e.target.value)} 
          w="180px" 
          size="sm"
          placeholder="Industry"
          icon={<FiChevronDown />}
          bg="white"
        >
          <option value="all">All Industries</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="commercial">Commercial</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="hospitality">Hospitality</option>
          <option value="technology">Technology</option>
        </Select>
        
        <Select 
          value={year} 
          onChange={(e) => setYear(e.target.value)} 
          w="120px" 
          size="sm"
          placeholder="Year"
          icon={<FiChevronDown />}
          bg="white"
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
        
        <Button 
          size="sm" 
          leftIcon={<FiFilter />} 
          variant="outline" 
          onClick={handleResetFilters}
          isDisabled={region === 'all' && industry === 'all' && year === 'all'}
        >
          Reset Filters
        </Button>
        
        <Button 
          size="sm" 
          leftIcon={<FiDownload />} 
          colorScheme="blue"
          ml="auto"
        >
          Export
        </Button>
      </Flex>
      
      {/* No Data Alert */}
      {hasNoData && (
        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          <Text>
            {(region !== 'all' || industry !== 'all' || year !== 'all') 
              ? 'No data matches your filter criteria. Try adjusting your filters.'
              : 'No audit reports have been uploaded yet. Upload some reports to see visualizations and insights.'}
          </Text>
        </Alert>
      )}
      
      {/* Summary Stats - First Row */}
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={8}>
        <StatCard 
          label="Total Audits" 
          value={filteredMetrics.totalAudits} 
          helpText={`${filteredOrganizations.length} organizations`}
          color="seai.primary" 
        />
        <StatCard 
          label="Total CO₂ Emissions Saved" 
          value={`${filteredMetrics.totalEmissionsSaved.toFixed(2)} tonnes`} 
          color="seai.secondary" 
        />
        <StatCard 
          label="Total Cost Savings" 
          value={`€${(filteredMetrics.totalEuroSaved || 0).toLocaleString()}`} 
          color="seai.accent" 
        />
        <StatCard 
          label="Audit Conversion" 
          value={`${metrics.auditConversion}%`} 
          helpText="Implementation rate"
          color="#6e1560" 
        />
        <StatCard 
          label="Total Grants" 
          value={`€${metrics.totalGrants.toLocaleString()}`} 
          helpText="Government funding"
          color="#cb6a15" 
        />
      </SimpleGrid>
      
      {/* Additional Stats - Second Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm">Recommended Grants & Funding</Heading>
            <Badge colorScheme="green" fontSize="sm" p={1}>
              €{metrics.totalRecommendedGrants.toLocaleString()} available
            </Badge>
          </Flex>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Grant Name</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recommendedGrants.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} textAlign="center">No grants matching current filters</Td>
                  </Tr>
                ) : (
                  recommendedGrants.slice(0, 4).map((grant, index) => (
                    <Tr key={index}>
                      <Td>{grant.name}</Td>
                      <Td isNumeric>€{grant.amount.toLocaleString()}</Td>
                      <Td>
                        <Badge 
                          colorScheme={
                            grant.status === 'Applied' ? 'blue' : 
                            grant.status === 'Eligible' ? 'green' : 
                            'yellow'
                          }
                        >
                          {grant.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
          <Heading size="sm" mb={4}>Completion Rate</Heading>
          <Flex justify="space-between" align="center" mb={6}>
            <CircularProgress 
              value={metrics.completionRate} 
              size="120px" 
              thickness="8px" 
              color="green.400"
            >
              <CircularProgressLabel fontWeight="bold" fontSize="xl">{metrics.completionRate}%</CircularProgressLabel>
            </CircularProgress>
            
            <Box flex="1" ml={8}>
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Submitted</Text>
                  <Text fontSize="sm" fontWeight="medium">{applicationStatus.total}</Text>
                </Flex>
                <Progress value={100} size="sm" colorScheme="blue" borderRadius="md" />
              </Box>
              
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">In Progress</Text>
                  <Text fontSize="sm" fontWeight="medium">{applicationStatus.inProgress}</Text>
                </Flex>
                <Progress value={(applicationStatus.inProgress / applicationStatus.total) * 100} size="sm" colorScheme="yellow" borderRadius="md" />
              </Box>
              
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Completed</Text>
                  <Text fontSize="sm" fontWeight="medium">{applicationStatus.completed}</Text>
                </Flex>
                <Progress value={(applicationStatus.completed / applicationStatus.total) * 100} size="sm" colorScheme="green" borderRadius="md" />
              </Box>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>
      
      {/* Application Status */}
      <Box mb={8}>
        <SectionHeading>Application Status</SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box textAlign="center" p={4} borderRadius="md" bg="gray.50">
              <Heading size="lg" color="orange.500">{applicationStatus.pending}</Heading>
              <Text fontWeight="medium" mt={2} color="gray.600">Pending</Text>
              <Text fontSize="sm" color="gray.500">{Math.round((applicationStatus.pending / applicationStatus.total) * 100)}% of total</Text>
            </Box>
            
            <Box textAlign="center" p={4} borderRadius="md" bg="gray.50">
              <Heading size="lg" color="blue.500">{applicationStatus.inProgress}</Heading>
              <Text fontWeight="medium" mt={2} color="gray.600">In Progress</Text>
              <Text fontSize="sm" color="gray.500">{Math.round((applicationStatus.inProgress / applicationStatus.total) * 100)}% of total</Text>
            </Box>
            
            <Box textAlign="center" p={4} borderRadius="md" bg="gray.50">
              <Heading size="lg" color="green.500">{applicationStatus.completed}</Heading>
              <Text fontWeight="medium" mt={2} color="gray.600">Completed</Text>
              <Text fontSize="sm" color="gray.500">{Math.round((applicationStatus.completed / applicationStatus.total) * 100)}% of total</Text>
            </Box>
            
            <Box textAlign="center" p={4} borderRadius="md" bg="gray.50">
              <Heading size="lg" color="red.500">{applicationStatus.rejected}</Heading>
              <Text fontWeight="medium" mt={2} color="gray.600">Rejected</Text>
              <Text fontSize="sm" color="gray.500">{Math.round((applicationStatus.rejected / applicationStatus.total) * 100)}% of total</Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
      
      {/* Energy Usage Breakdown */}
      <Box mb={8}>
        <SectionHeading>Energy Usage Breakdown</SectionHeading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Energy Type Distribution */}
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="330px">
            <Heading size="sm" mb={4}>Energy Type Distribution</Heading>
            {energyTypeDistribution.every(item => item.value === 0) ? (
              <Flex justify="center" align="center" h="80%">
                <Text color="gray.500">No energy data available. Upload reports to see distribution.</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={energyTypeDistribution}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {energyTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} kWh`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '5px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
          
          {/* Recommended Action Types */}
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="330px">
            <Heading size="sm" mb={4}>Recommended Action Types</Heading>
            {recommendedActionTypes.every(item => item.energySavings === 0) ? (
              <Flex justify="center" align="center" h="80%">
                <Text color="gray.500">No recommendation data available. Upload reports to see actions.</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={recommendedActionTypes}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 20, // Adequate bottom margin for labels
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                    height={40} // Reasonable height for labels
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '5px' }} />
                  <Bar dataKey="energySavings" name="Energy Savings (kWh)" fill="#3a1e6d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Energy Consumption Breakdown */}
      <Box mb={8}>
        <SectionHeading>Energy Consumption Breakdown</SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="350px">
          <Heading size="sm" mb={4}>Consumption by Sector</Heading>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={energyConsumptionBreakdown}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="residential" stackId="1" stroke="#3a1e6d" fill="#3a1e6d" />
              <Area type="monotone" dataKey="commercial" stackId="1" stroke="#00813a" fill="#00813a" />
              <Area type="monotone" dataKey="industrial" stackId="1" stroke="#cb6a15" fill="#cb6a15" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      
      {/* Monthly Energy Trends */}
      <Box mb={8}>
        <SectionHeading>Monthly Energy Trends</SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyEnergyUsage}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="electricity" stroke="#3a1e6d" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="heating" stroke="#cb6a15" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      
      {/* Recommended Actions Table */}
      <Box mb={8}>
        <SectionHeading 
          actionBtn={
            <Button size="sm" variant="outline" leftIcon={<FiDownload />}>
              Export Actions
            </Button>
          }
        >
          Top Recommended Actions
        </SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
          {!filteredRecommendedActions || filteredRecommendedActions.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>No recommended actions available for the selected filters.</Text>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Action</Th>
                    <Th isNumeric>Energy Savings (kWh)</Th>
                    <Th isNumeric>Cost Savings (€)</Th>
                    <Th isNumeric>CO₂ Reduction (tonnes)</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRecommendedActions.slice(0, 5).map((action, index) => (
                    <Tr key={index}>
                      <Td>{action.name}</Td>
                      <Td isNumeric>{action.energySavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.costSavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.emissionsReduction.toFixed(2)}</Td>
                      <Td>
                        <Badge colorScheme={
                          action.status === 'Implemented' ? "green" : 
                          action.status === 'In Progress' ? "yellow" : 
                          "gray"
                        }>
                          {action.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      
      {/* Auditor Performance */}
      <Box mb={8}>
        <SectionHeading>Auditor Performance</SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Auditor</Th>
                  <Th>Role</Th>
                  <Th isNumeric>Audits Completed</Th>
                  <Th isNumeric>Conversion Rate</Th>
                  <Th isNumeric>Avg. Energy Savings</Th>
                  <Th isNumeric>Avg. Cost Savings</Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditorPerformance.map((auditor, index) => (
                  <Tr key={index}>
                    <Td>
                      <Flex align="center">
                        <Avatar size="sm" name={auditor.name} mr={2} />
                        <Text fontWeight="medium">{auditor.name}</Text>
                      </Flex>
                    </Td>
                    <Td>{auditor.role}</Td>
                    <Td isNumeric>{auditor.auditsCompleted}</Td>
                    <Td isNumeric>
                      <Flex align="center" justify="flex-end">
                        <Badge colorScheme={auditor.conversionRate > 70 ? "green" : "blue"} mr={2}>
                          {auditor.conversionRate}%
                        </Badge>
                        {auditor.conversionRate > 70 ? 
                          <Icon as={FiArrowUp} color="green.500" /> : 
                          <Icon as={FiArrowDown} color="blue.500" />
                        }
                      </Flex>
                    </Td>
                    <Td isNumeric>{auditor.avgEnergySavings.toLocaleString()} kWh</Td>
                    <Td isNumeric>€{auditor.avgCostSavings.toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      
      {/* Organizations */}
      <Box mb={8}>
        <SectionHeading>Organizations</SectionHeading>
        {!filteredOrganizations || filteredOrganizations.length === 0 ? (
          <Text color="gray.500">No organizations available for the selected filters.</Text>
        ) : (
          <Flex flexWrap="wrap" gap={2}>
            {filteredOrganizations.map((org, index) => (
              <Badge key={index} colorScheme="purple" p={2} borderRadius="md">
                {org}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
    </Container>
  );
}