import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function Upload({ updateDashboard }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError('Please select a valid PDF file');
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError('Please drop a valid PDF file');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setExtractedData(null);
    
    const progressCleanup = simulateProgress();
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      setExtractedData(data.extractedData);
      updateDashboard(data.dashboardData);
      
      toast({
        title: 'Upload successful',
        description: 'The PDF was uploaded and processed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.message || 'An error occurred during upload');
      
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      progressCleanup();
    }
  };
  
  const handleNavigate = () => {
    navigate('/');
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>Upload Energy Audit Report</Heading>
      
      <VStack spacing={6} align="stretch">
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Box
          borderWidth={2}
          borderRadius="md"
          borderStyle="dashed"
          borderColor="gray.300"
          p={8}
          bg="gray.50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          textAlign="center"
          cursor="pointer"
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <Icon as={FiUpload} w={12} h={12} color="gray.400" mb={4} />
          <Heading size="md" mb={2}>Drag and drop your PDF file</Heading>
          <Text color="gray.500">or click to browse your files</Text>
          
          {selectedFile && (
            <Flex mt={4} align="center" justify="center">
              <Icon as={FiFile} mr={2} color="seai.primary" />
              <Text fontWeight="medium">{selectedFile.name}</Text>
            </Flex>
          )}
        </Box>
        
        {isUploading && (
          <Box>
            <Text mb={2}>Uploading and processing...</Text>
            <Progress value={uploadProgress} size="sm" colorScheme="purple" borderRadius="md" />
          </Box>
        )}
        
        <HStack spacing={4}>
          <Button
            colorScheme="purple"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading"
            isDisabled={!selectedFile || isUploading}
          >
            Upload and Process
          </Button>
          <Button variant="outline" onClick={() => setSelectedFile(null)} isDisabled={!selectedFile || isUploading}>
            Cancel
          </Button>
        </HStack>
        
        {extractedData && (
          <Box mt={6} p={6} borderWidth={1} borderRadius="md" bg="white">
            <Heading size="md" mb={4} color="seai.primary">Extracted Data</Heading>
            
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold">Organization:</Text>
                <Text>{extractedData.organizationName}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Total Cost Savings:</Text>
                <Text>€{(extractedData.totalCostSavings || 0).toLocaleString()}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Total Emissions Saved:</Text>
                <Text>{(extractedData.totalEmissionsSaved || 0).toFixed(2)} tonnes CO₂e</Text>
              </Box>
              
              {extractedData.energyData && extractedData.energyData.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Energy Data:</Text>
                  {extractedData.energyData.map((item, index) => (
                    <Box key={index} p={2} bg="gray.50" borderRadius="md" mb={2}>
                      <Text><strong>{item.type}:</strong> {item.usage.toLocaleString()} kWh, €{item.cost.toLocaleString()}, {item.emissions.toFixed(2)} tonnes CO₂e</Text>
                    </Box>
                  ))}
                </Box>
              )}
              
              {extractedData.recommendedActions && extractedData.recommendedActions.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Recommended Actions:</Text>
                  {extractedData.recommendedActions.map((action, index) => (
                    <Box key={index} p={2} bg="gray.50" borderRadius="md" mb={2}>
                      <Text><strong>{action.name}</strong></Text>
                      <Text>Energy Savings: {action.energySavings.toLocaleString()} kWh</Text>
                      <Text>Cost Savings: €{action.costSavings.toLocaleString()}</Text>
                      <Text>Emissions Reduction: {action.emissionsReduction.toFixed(2)} tonnes CO₂e</Text>
                    </Box>
                  ))}
                </Box>
              )}
            </VStack>
            
            <Flex justify="center" mt={6}>
              <Button colorScheme="green" onClick={handleNavigate}>
                View Dashboard
              </Button>
            </Flex>
          </Box>
        )}
      </VStack>
    </Container>
  );
}