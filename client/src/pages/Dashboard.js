import React, { useState } from 'react';
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
  const [year, setYear] = useState('2023');
  
  // Process data for charts with fallback data for empty state
  const energyTypeDistribution = React.useMemo(() => {
    if (!data.energyData || data.energyData.length === 0) {
      console.log("No energy data available, using fallback data");
      return [
        { name: 'Electricity', value: 0 },
        { name: 'Natural Gas', value: 0 },
        { name: 'Oil', value: 0 }
      ];
    }
    
    console.log("Processing energy data for visualization");
    const energyTypes = {};
    data.energyData.forEach(item => {
      if (!energyTypes[item.type]) {
        energyTypes[item.type] = 0;
      }
      energyTypes[item.type] += item.usage || 0;
    });
    
    return Object.keys(energyTypes).map(type => ({
      name: type,
      value: energyTypes[type]
    }));
  }, [data.energyData]);
  
  const recommendedActionTypes = React.useMemo(() => {
    if (!data.recommendedActions || data.recommendedActions.length === 0) {
      console.log("No recommended actions available, using fallback data");
      return [
        { name: 'Solar PV', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 },
        { name: 'LED Lighting', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 },
        { name: 'Heat Pump', energySavings: 0, costSavings: 0, emissionsReduction: 0, count: 0 }
      ];
    }
    
    console.log("Processing recommended actions for visualization");
    const actionTypes = {};
    data.recommendedActions.forEach(item => {
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
  }, [data.recommendedActions]);
  
  // Monthly energy usage data (placeholder or derived from real data)
  const monthlyEnergyUsage = React.useMemo(() => {
    // If we had actual monthly data, we would process it here
    // For now, providing placeholder data that matches what we'd expect
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
  
  // Application status data
  const applicationStatus = React.useMemo(() => {
    return {
      pending: data.applicationStatus?.pending || 15,
      inProgress: data.applicationStatus?.inProgress || 28,
      completed: data.applicationStatus?.completed || 45,
      rejected: data.applicationStatus?.rejected || 12,
      total: data.applicationStatus?.total || 100
    };
  }, [data.applicationStatus]);
  
  // Energy consumption breakdown data
  const energyConsumptionBreakdown = React.useMemo(() => {
    return [
      { month: 'Jan', residential: 120, commercial: 230, industrial: 450 },
      { month: 'Feb', residential: 130, commercial: 240, industrial: 430 },
      { month: 'Mar', residential: 140, commercial: 250, industrial: 410 },
      { month: 'Apr', residential: 150, commercial: 260, industrial: 420 },
      { month: 'May', residential: 160, commercial: 270, industrial: 400 },
      { month: 'Jun', residential: 170, commercial: 280, industrial: 390 }
    ];
  }, []);
  
  // Recommended grants data
  const recommendedGrants = React.useMemo(() => {
    return [
      { name: 'SEAI Commercial Grant', amount: 45000, status: 'Applied' },
      { name: 'Energy Efficiency Fund', amount: 75000, status: 'Eligible' },
      { name: 'Green Business Fund', amount: 35000, status: 'Recommended' },
      { name: 'Renewable Heat Incentive', amount: 28000, status: 'Eligible' }
    ];
  }, []);
  
  // Auditor performance data - sorted by completion rate
  const auditorPerformance = React.useMemo(() => {
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
    let auditConversion = data.auditConversion || 68; // Default value if not provided
    let totalGrants = data.totalGrants || 185000; // Default value if not provided
    let completionRate = Math.round((applicationStatus.completed / applicationStatus.total) * 100) || 45;
    
    if (data.totalAudits > 0) {
      avgSavingsPerAudit = data.totalEuroSaved / data.totalAudits;
      avgEmissionsPerAudit = data.totalEmissionsSaved / data.totalAudits;
    }
    
    return {
      avgSavingsPerAudit,
      avgEmissionsPerAudit,
      auditConversion,
      totalGrants,
      completionRate,
      totalRecommendedGrants: recommendedGrants.reduce((sum, grant) => sum + grant.amount, 0)
    };
  }, [data.totalAudits, data.totalEuroSaved, data.totalEmissionsSaved, data.auditConversion, data.totalGrants, applicationStatus, recommendedGrants]);
  
  const COLORS = ['#3a1e6d', '#00813a', '#46A09A', '#cb6a15', '#6e1560', '#9B2C2C'];

  // Check for no data condition
  const hasNoData = !data.reports || data.reports.length === 0;

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
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </Select>
        
        <Button 
          size="sm" 
          leftIcon={<FiFilter />} 
          variant="outline" 
          ml="auto"
        >
          More Filters
        </Button>
        
        <Button 
          size="sm" 
          leftIcon={<FiDownload />} 
          colorScheme="blue"
        >
          Export
        </Button>
      </Flex>
      
      {/* No Data Alert */}
      {hasNoData && (
        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          <Text>No audit reports have been uploaded yet. Upload some reports to see visualizations and insights.</Text>
        </Alert>
      )}
      
      {/* Summary Stats - First Row */}
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={8}>
        <StatCard 
          label="Total Audits" 
          value={data.totalAudits} 
          helpText={`${data.organizations.length} organizations`}
          color="seai.primary" 
        />
        <StatCard 
          label="Total CO₂ Emissions Saved" 
          value={`${data.totalEmissionsSaved.toFixed(2)} tonnes`} 
          color="seai.secondary" 
        />
        <StatCard 
          label="Total Cost Savings" 
          value={`€${(data.totalEuroSaved || 0).toLocaleString()}`} 
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
                {recommendedGrants.map((grant, index) => (
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
                ))}
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
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="380px">
            <Heading size="sm" mb={4}>Energy Type Distribution</Heading>
            {energyTypeDistribution.every(item => item.value === 0) ? (
              <Flex justify="center" align="center" h="80%">
                <Text color="gray.500">No energy data available. Upload reports to see distribution.</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
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
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
          
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="300px">
            <Heading size="sm" mb={4}>Recommended Action Types</Heading>
            {recommendedActionTypes.every(item => item.energySavings === 0) ? (
              <Flex justify="center" align="center" h="80%">
                <Text color="gray.500">No recommendation data available. Upload reports to see actions.</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recommendedActionTypes}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value} 
                  />
                  <YAxis />
                  <Tooltip />
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
          {!data.recommendedActions || data.recommendedActions.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>No recommended actions available. Upload reports to see recommendations.</Text>
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
                  {data.recommendedActions.slice(0, 5).map((action, index) => (
                    <Tr key={index}>
                      <Td>{action.name}</Td>
                      <Td isNumeric>{action.energySavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.costSavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.emissionsReduction.toFixed(2)}</Td>
                      <Td>
                        <Badge colorScheme={index % 3 === 0 ? "green" : index % 3 === 1 ? "yellow" : "gray"}>
                          {index % 3 === 0 ? "Implemented" : index % 3 === 1 ? "In Progress" : "Pending"}
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
        {!data.organizations || data.organizations.length === 0 ? (
          <Text color="gray.500">No organizations available. Upload reports to see the list.</Text>
        ) : (
          <Flex flexWrap="wrap" gap={2}>
            {data.organizations.map((org, index) => (
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