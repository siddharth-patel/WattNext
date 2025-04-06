import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stack,
  Image,
  Text
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';

const NavLink = ({ children, to, isActive }) => (
  <Link
    as={RouterLink}
    px={2}
    py={1}
    rounded={'md'}
    to={to}
    fontWeight={isActive ? 'bold' : 'medium'}
    color={isActive ? 'seai.primary' : 'gray.600'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.100',
    }}
  >
    {children}
  </Link>
);

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Upload Reports', path: '/upload' },
    { name: 'View Reports', path: '/reports' }
  ];

  return (
    <Box bg={'white'} px={4} boxShadow={'sm'}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Flex alignItems="center">
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="seai.primary"
            >
              SEAI Energy Audit Dashboard
            </Text>
          </Flex>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {links.map((link) => (
              <NavLink key={link.name} to={link.path} isActive={location.pathname === link.path}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <Button
            as={RouterLink}
            to="/upload"
            variant="primary"
            size="sm"
            mr={4}
            leftIcon={<span>📤</span>}
          >
            Upload Audit
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <span>👤</span>
            </MenuButton>
            <MenuList>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Help</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {links.map((link) => (
              <NavLink key={link.name} to={link.path} isActive={location.pathname === link.path}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}