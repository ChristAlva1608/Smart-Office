import React from "react"
import { Flex, Image, useBreakpointValue, Box, Text } from "@chakra-ui/react"

import Logo from "/assets/images/smart-home.png"
import UserMenu from "./UserMenu"

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" })

  return (
    <Flex
      display={display}
      justify="space-between"
      position="sticky"
      color="gray.900"
      align="center"
      bg="white"
      w="100%"
      top={0}
      p={4}
      boxShadow="sm"
      zIndex={10}
    >
      <Flex align="center" gap={4}>
        <Box bg="teal.50" borderRadius="lg" p={1} display="flex" alignItems="center" justifyContent="center">
          <Image 
            src={Logo} 
            alt="Logo" 
            w="40px"
            h="40px"
            objectFit="contain"
          />
        </Box>
        <Text fontWeight="bold" fontSize="xl" color="teal.700" letterSpacing="wide">
          SmartHome
        </Text>
      </Flex>
      <Flex gap={2} alignItems="center">
        <UserMenu />
      </Flex>
    </Flex>
  )
}

export default Navbar
