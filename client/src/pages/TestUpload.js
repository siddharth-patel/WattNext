import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  Code,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

function TestUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>Upload Test Page</Heading>
      <Text mb={4}>
        This page tests the basic file upload functionality without any PDF processing.
      </Text>

      <VStack spacing={4} align="stretch">
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box>
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            pt={1}
          />
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleUpload}
          isLoading={isUploading}
          isDisabled={!selectedFile || isUploading}
        >
          Test Upload
        </Button>

        {result && (
          <Box mt={4} p={4} borderWidth={1} borderRadius="md">
            <Heading size="sm" mb={2}>Upload Result:</Heading>
            <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
              {JSON.stringify(result, null, 2)}
            </Code>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default TestUpload;