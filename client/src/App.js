// client/src/App.js
import React from 'react';
import { ChakraProvider, Box, Heading, Text } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <Box p={5}>
        <Heading>WattNext Dashboard</Heading>
        <Text mt={4}>Welcome to the WattNext Energy Audit Dashboard</Text>
        <Text>This is a simplified version to verify the basic setup works.</Text>
      </Box>
    </ChakraProvider>
  );
}

export default App;