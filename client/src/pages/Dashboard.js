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
  Center
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
  Legend
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

export default function Dashboard({ data, isLoading }) {
  // Process data for charts
  const energyTypeDistribution = React.useMemo(() => {
    if (!data.energyData || data.energyData.length === 0) return [];
    
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
    if (!data.recommendedActions || data.recommendedActions.length === 0) return [];
    
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
  
  const COLORS = ['#3a1e6d', '#00813a', '#46A09A', '#cb6a15', '#6e1560', '#9B2C2C'];

  if (isLoading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="seai.primary" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Energy Audit Dashboard</Heading>
      
      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
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
      </SimpleGrid>
      
      {/* Energy Usage Breakdown */}
      <Box mb={8}>
        <SectionHeading>Energy Usage Breakdown</SectionHeading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="300px">
            <Heading size="sm" mb={4}>Energy Type Distribution</Heading>
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
          </Box>
          
          <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg" height="300px">
            <Heading size="sm" mb={4}>Recommended Action Types</Heading>
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
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="energySavings" name="Energy Savings (kWh)" fill="#3a1e6d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Recommended Actions Table */}
      <Box mb={8}>
        <SectionHeading>Top Recommended Actions</SectionHeading>
        <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
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
        </Box>
      </Box>
      
      {/* Organizations */}
      <Box mb={8}>
        <SectionHeading>Organizations</SectionHeading>
        <Flex flexWrap="wrap" gap={2}>
          {data.organizations.map((org, index) => (
            <Badge key={index} colorScheme="purple" p={2} borderRadius="md">
              {org}
            </Badge>
          ))}
        </Flex>
      </Box>
    </Container>
  );
}