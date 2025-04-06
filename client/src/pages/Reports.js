import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Flex,
  IconButton,
  Collapse,
  Spinner,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Divider
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  SearchIcon
} from '@chakra-ui/icons';
import { format } from 'date-fns';

const ReportCard = ({ report }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { fileName, organizationName, uploadDate, data } = report;
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg"
      overflow="hidden" 
      bg="white"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <Flex 
        p={4} 
        justify="space-between" 
        align="center" 
        onClick={() => setIsOpen(!isOpen)}
        cursor="pointer"
      >
        <Box>
          <Heading size="sm" fontWeight="semibold">
            {organizationName}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {fileName} • {format(new Date(uploadDate), 'PPP')}
          </Text>
        </Box>
        <HStack>
          {data.emissionsReductionPct && (
            <Badge colorScheme="green">
              {data.emissionsReductionPct}% reduction
            </Badge>
          )}
          <IconButton
            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            variant="ghost"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            size="sm"
          />
        </HStack>
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <Divider />
        <Box p={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">Cost Savings</Text>
              <Text fontWeight="bold" fontSize="lg">€{(data.totalCostSavings || 0).toLocaleString()}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">CO₂ Emissions Saved</Text>
              <Text fontWeight="bold" fontSize="lg">{(data.totalEmissionsSaved || 0).toFixed(2)} tonnes</Text>
            </Box>
          </SimpleGrid>
          
          {data.energyData && data.energyData.length > 0 && (
            <Box mt={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2}>Energy Usage</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                {data.energyData.map((item, index) => (
                  <Box key={index} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm"><strong>{item.type}:</strong> {item.usage.toLocaleString()} kWh</Text>
                    <HStack fontSize="xs" color="gray.500" mt={1}>
                      <Text>€{item.cost.toLocaleString()}</Text>
                      <Text>•</Text>
                      <Text>{item.emissions.toFixed(2)} t CO₂e</Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
          
          {data.recommendedActions && data.recommendedActions.length > 0 && (
            <Box mt={4}>
              <Text fontWeight="bold" fontSize="sm" mb={2}>Top Recommended Actions</Text>
              <VStack align="stretch" spacing={2}>
                {data.recommendedActions.slice(0, 3).map((action, index) => (
                  <Box key={index} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">{action.name}</Text>
                    <HStack fontSize="xs" color="gray.500" mt={1}>
                      <Text>{action.energySavings.toLocaleString()} kWh</Text>
                      <Text>•</Text>
                      <Text>€{action.costSavings.toLocaleString()}</Text>
                      <Text>•</Text>
                      <Text>{action.emissionsReduction.toFixed(2)} t CO₂e</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default function Reports({ reports, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    
    let filtered = [...reports];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.organizationName.toLowerCase().includes(query) ||
        report.fileName.toLowerCase().includes(query)
      );
    }
    
    // Sort reports
    switch (sortBy) {
      case 'organization':
        filtered.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
        break;
      case 'savings':
        filtered.sort((a, b) => (b.data.totalCostSavings || 0) - (a.data.totalCostSavings || 0));
        break;
      case 'emissions':
        filtered.sort((a, b) => (b.data.totalEmissionsSaved || 0) - (a.data.totalEmissionsSaved || 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    
    return filtered;
  }, [reports, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="seai.primary" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={6}>Energy Audit Reports</Heading>
      
      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by organization or filename"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Select
          width={{ base: '100%', md: '200px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Latest First</option>
          <option value="organization">Organization</option>
          <option value="savings">Highest Savings</option>
          <option value="emissions">Highest Emissions Reduction</option>
        </Select>
      </Flex>
      
      {filteredReports.length === 0 ? (
        <Box textAlign="center" p={8}>
          <Text>No reports found. Upload some audit reports to get started.</Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredReports.map((report, index) => (
            <ReportCard key={index} report={report} />
          ))}
        </VStack>
      )}
    </Container>
  );
}