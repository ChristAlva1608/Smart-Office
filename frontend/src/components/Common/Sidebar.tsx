import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { FiLogOut } from "react-icons/fi"

import Logo from "/assets/images/smart-home.png"
import type { UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "../ui/drawer"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <DrawerRoot
        placement="start"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <IconButton
            variant="ghost"
            color="inherit"
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="absolute"
            zIndex="100"
            m={4}
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="xs">
          <DrawerCloseTrigger />
          <DrawerBody>
            <Flex flexDir="column" justify="space-between">
              <Box>
                <Link to="/">
                  <Image 
                    src={Logo} 
                    alt="Logo" 
                    w="120px"
                    h="auto"
                    objectFit="contain"
                    p={2}
                    mb={4}
                  />
                </Link>
                <SidebarItems onClose={() => setOpen(false)} />
                <Flex
                  as="button"
                  onClick={() => {
                    logout()
                  }}
                  alignItems="center"
                  gap={4}
                  px={4}
                  py={2}
                >
                  <FiLogOut />
                  <Text>Log Out</Text>
                </Flex>
              </Box>
              {currentUser?.email && (
                <Text fontSize="sm" p={2} truncate maxW="sm">
                  Logged in as: {currentUser.email}
                </Text>
              )}
            </Flex>
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        position="sticky"
        bg="bg.subtle"
        top={0}
        minW="xs"
        h="100vh"
        p={4}
      >
        <Flex flexDir="column" w="100%" h="100%">
          <Link to="/">
            <Image 
              src={Logo} 
              alt="Logo" 
              w="120px"
              h="auto"
              objectFit="contain"
              p={2}
              mb={4}
            />
          </Link>
          <Box flex="1">
            <SidebarItems />
          </Box>
          <Flex
            as="button"
            onClick={() => {
              logout()
            }}
            alignItems="center"
            gap={4}
            px={4}
            py={2}
            mt="auto"
          >
            <FiLogOut />
            <Text>Log Out</Text>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}

export default Sidebar
