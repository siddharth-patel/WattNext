import React from 'react';
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
  Avatar
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

const StatCard = ({ label, value, helpText, color }) => (
  <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
    <Stat>
      <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
      <StatNumber fontSize="2xl" fontWeight="bold" color={color}>{value}</StatNumber>
      {helpText && <StatHelpText>{helpText}</StatHelpText>}
    </Stat>
  </Box>
);

const SectionHeading = ({ children }) => (
  <Heading size="md" mb={4} color="seai.primary">
    {children}
  </Heading>
);

const AuditorCard = ({ auditor }) => (
  <Box p={4} shadow="sm" borderWidth="1px" bg="white" borderRadius="lg">
    <Flex>
      <Avatar name={auditor.name} src={auditor.avatar} size="md" mr={3} />
      <Box>
        <Text fontWeight="bold">{auditor.name}</Text>
        <Text fontSize="sm" color="gray.500">{auditor.role}</Text>
      </Box>
    </Flex>
    <Divider my={3} />
    <SimpleGrid columns={2} spacing={2} mt={2}>
      <Box>
        <Text fontSize="xs" color="gray.500">Audits Completed</Text>
        <Text fontWeight="bold">{auditor.auditsCompleted}</Text>
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.500">Conversion Rate</Text>
        <Text fontWeight="bold">{auditor.conversionRate}%</Text>
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.500">Avg. Energy Savings</Text>
        <Text fontWeight="bold">{auditor.avgEnergySavings} kWh</Text>
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.500">Avg. Cost Savings</Text>
        <Text fontWeight="bold">€{auditor.avgCostSavings}</Text>
      </Box>
    </SimpleGrid>
  </Box>
);

export default function Dashboard({ data, isLoading }) {
  // Log the data being received by the Dashboard
  console.log("Dashboard receiving data:", data);

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
  
  // Auditor performance data
  const auditorPerformance = React.useMemo(() => {
    return data.auditors || [
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
  }, [data.auditors]);
  
  // Calculate totals and averages
  const metrics = React.useMemo(() => {
    let avgSavingsPerAudit = 0;
    let avgEmissionsPerAudit = 0;
    let auditConversion = data.auditConversion || 68; // Default value if not provided
    let totalGrants = data.totalGrants || 185000; // Default value if not provided
    
    if (data.totalAudits > 0) {
      avgSavingsPerAudit = data.totalEuroSaved / data.totalAudits;
      avgEmissionsPerAudit = data.totalEmissionsSaved / data.totalAudits;
    }
    
    return {
      avgSavingsPerAudit,
      avgEmissionsPerAudit,
      auditConversion,
      totalGrants
    };
  }, [data.totalAudits, data.totalEuroSaved, data.totalEmissionsSaved, data.auditConversion, data.totalGrants]);
  
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
      <Heading mb={6}>WattNext Energy Audit Dashboard</Heading>
      
      {/* Summary Stats */}
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
      
      {/* No Data Alert */}
      {hasNoData && (
        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          <Text>No audit reports have been uploaded yet. Upload some reports to see visualizations and insights.</Text>
        </Alert>
      )}
      
      {/* Application Status */}
      <Box mb={8}>
        <SectionHeading>Application Status</SectionHeading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
            <Heading size="sm" mb={4}>Status Distribution</Heading>
            <HStack spacing={4} mb={4} justify="space-around">
              <Box textAlign="center">
                <CircularProgress value={applicationStatus.pending / applicationStatus.total * 100} color="orange.400" size="80px">
                  <CircularProgressLabel>{applicationStatus.pending}</CircularProgressLabel>
                </CircularProgress>
                <Text mt={2} fontSize="sm">Pending</Text>
              </Box>
              <Box textAlign="center">
                <CircularProgress value={applicationStatus.inProgress / applicationStatus.total * 100} color="blue.400" size="80px">
                  <CircularProgressLabel>{applicationStatus.inProgress}</CircularProgressLabel>
                </CircularProgress>
                <Text mt={2} fontSize="sm">In Progress</Text>
              </Box>
              <Box textAlign="center">
                <CircularProgress value={applicationStatus.completed / applicationStatus.total * 100} color="green.400" size="80px">
                  <CircularProgressLabel>{applicationStatus.completed}</CircularProgressLabel>
                </CircularProgress>
                <Text mt={2} fontSize="sm">Completed</Text>
              </Box>
              <Box textAlign="center">
                <CircularProgress value={applicationStatus.rejected / applicationStatus.total * 100} color="red.400" size="80px">
                  <CircularProgressLabel>{applicationStatus.rejected}</CircularProgressLabel>
                </CircularProgress>
                <Text mt={2} fontSize="sm">Rejected</Text>
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Total Applications: {applicationStatus.total}
            </Text>
          </Box>
          
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
            <Heading size="sm" mb={4}>Completion Rate</Heading>
            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm">Pending Review</Text>
                <Text fontSize="sm" fontWeight="bold">{applicationStatus.pending}%</Text>
              </Flex>
              <Progress value={applicationStatus.pending} size="sm" colorScheme="orange" borderRadius="md" mb={2} />
              
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm">In Progress</Text>
                <Text fontSize="sm" fontWeight="bold">{applicationStatus.inProgress}%</Text>
              </Flex>
              <Progress value={applicationStatus.inProgress} size="sm" colorScheme="blue" borderRadius="md" mb={2} />
              
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm">Completed</Text>
                <Text fontSize="sm" fontWeight="bold">{applicationStatus.completed}%</Text>
              </Flex>
              <Progress value={applicationStatus.completed} size="sm" colorScheme="green" borderRadius="md" mb={2} />
              
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm">Rejected</Text>
                <Text fontSize="sm" fontWeight="bold">{applicationStatus.rejected}%</Text>
              </Flex>
              <Progress value={applicationStatus.rejected} size="sm" colorScheme="red" borderRadius="md" />
            </Box>
            <Divider my={4} />
            <Flex justify="space-between">
              <Text fontSize="sm">Overall Completion</Text>
              <Badge colorScheme="green" fontSize="sm">{applicationStatus.completed}%</Badge>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Energy Usage Breakdown */}
      <Box mb={8}>
        <SectionHeading>Energy Usage Breakdown</SectionHeading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="300px">
            <Heading size="sm" mb={4}>Energy Type Distribution</Heading>
            {energyTypeDistribution.every(item => item.value === 0) ? (
              <Flex justify="center" align="center" h="80%">
                <Text color="gray.500">No energy data available. Upload reports to see distribution.</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyTypeDistribution}
                    cx="50%"
                    cy="50%"
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
                  <Legend />
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
      
      {/* Performance Metrics */}
      <Box mb={8}>
        <SectionHeading>Performance Metrics</SectionHeading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
            <Stat>
              <StatLabel>Average Savings Per Audit</StatLabel>
              <StatNumber>€{metrics.avgSavingsPerAudit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</StatNumber>
              <StatHelpText>Based on {data.totalAudits} audits</StatHelpText>
            </Stat>
          </Box>
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
            <Stat>
              <StatLabel>Average Emissions Reduction</StatLabel>
              <StatNumber>{metrics.avgEmissionsPerAudit.toFixed(2)} tonnes</StatNumber>
              <StatHelpText>CO₂ equivalent per audit</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Recommended Actions Table */}
      <Box mb={8}>
        <SectionHeading>Top Recommended Actions</SectionHeading>
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
                  </Tr>
                </Thead>
                <Tbody>
                  {data.recommendedActions.slice(0, 5).map((action, index) => (
                    <Tr key={index}>
                      <Td>{action.name}</Td>
                      <Td isNumeric>{action.energySavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.costSavings.toLocaleString()}</Td>
                      <Td isNumeric>{action.emissionsReduction.toFixed(2)}</Td>
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
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {auditorPerformance.map((auditor, index) => (
            <AuditorCard key={index} auditor={auditor} />
          ))}
        </SimpleGrid>
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