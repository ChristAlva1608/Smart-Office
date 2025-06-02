import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Popover,
  Flex,
  Button,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { FiBell, FiCheckCircle, FiInbox } from "react-icons/fi";
import { useNotifications } from "../../hooks/useNotifications";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread" | "action">("all");
  const unread = notifications.filter(n => !n.is_read);
  const requiresAction = notifications.filter(n => n.message.toLowerCase().includes("action"));
  const [animate, setAnimate] = useState(false);
  const prevUnread = useRef(unread.length);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unread.length > prevUnread.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 700);
    }
    prevUnread.current = unread.length;
  }, [unread.length]);

  async function markAllRead() {
    for (const n of unread) {
      await fetch(`/api/v1/notifications/${n.id}/read`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
    }
    refetch();
  }

  // Fallback colors for popover and empty state
  const popoverBg = "#fff";
  const popoverShadow = "0 8px 32px rgba(0,0,0,0.12)";
  const emptyBg = "#f7fafc";
  const dividerColor = "#e2e8f0";

  const renderTabContent = () => {
    let list = notifications;
    if (tab === "unread") list = unread;
    if (tab === "action") list = requiresAction;

    if (isLoading) return <Spinner size="sm" />;
    if (list.length === 0)
      return (
        <Flex direction="column" align="center" py={8} color="gray.400" bg={emptyBg} borderRadius="lg">
          <Box bg="#fff" borderRadius="full" p={3} mb={2} boxShadow="sm">
            <FiInbox size={32} />
          </Box>
          <Text mt={2} fontWeight="medium">You're all caught up!</Text>
          <Text fontSize="sm" color="gray.400">No notifications to show</Text>
        </Flex>
      );

    return list.map((n, idx) => (
      <React.Fragment key={n.id}>
        <Box
          bg={n.is_read ? "#f7fafc" : "#e6fffa"}
          borderRadius="xl"
          boxShadow="sm"
          p={3}
          mb={3}
          _hover={{ boxShadow: "md", bg: n.is_read ? "#edf2f7" : "#b2f5ea" }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Box flex="1">
            <Text fontSize="sm" fontWeight={n.is_read ? "normal" : "semibold"}>{n.message}</Text>
            <Text fontSize="xs" color="gray.400" mt={1}>{timeAgo(n.created_at)}</Text>
          </Box>
          {!n.is_read && (
            <IconButton aria-label="Mark as read" size="sm" colorScheme="green" variant="ghost" onClick={async () => { await fetch(`/api/v1/notifications/${n.id}/read`, { method: "POST", credentials: "include", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, }); refetch(); }}>
              <FiCheckCircle />
            </IconButton>
          )}
        </Box>
        {idx < list.length - 1 && <Box as="hr" my={1} border="none" borderTop={`1px solid ${dividerColor}`} />}
      </React.Fragment>
    ));
  };

  // Tab button style
  const tabBtn = (active: boolean, color: string, bg: string) => ({
    fontWeight: active ? "bold" : "normal",
    background: active ? bg : "transparent",
    borderRadius: 16,
    padding: "4px 16px",
    border: "none",
    cursor: "pointer",
    color: active ? color : undefined,
    outline: active ? `2px solid ${color}` : undefined,
    boxShadow: active ? "0 2px 8px rgba(49,151,149,0.08)" : undefined,
    transition: "background 0.2s, color 0.2s, outline 0.2s",
  });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            variant="ghost"
            size="lg"
            tabIndex={0}
            _hover={{ bg: "#e6fffa" }}
            _focus={{ boxShadow: "outline" }}
            style={animate ? { animation: "ring 0.7s" } : {}}
          >
            <FiBell size={24} />
          </IconButton>
          {unread.length > 0 && (
            <Box
              as="span"
              position="absolute"
              top={2}
              right={2}
              w={3}
              h={3}
              bg="red.400"
              borderRadius="full"
              border="2px solid white"
              boxShadow="0 0 0 2px white"
              zIndex={1}
              animation={animate ? "pulse 0.7s" : undefined}
            />
          )}
          <style>{`
            @keyframes ring {
              0% { transform: rotate(0); }
              15% { transform: rotate(-15deg); }
              30% { transform: rotate(10deg); }
              45% { transform: rotate(-10deg); }
              60% { transform: rotate(6deg); }
              75% { transform: rotate(-4deg); }
              100% { transform: rotate(0); }
            }
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(245,101,101,0.7); }
              70% { box-shadow: 0 0 0 8px rgba(245,101,101,0); }
              100% { box-shadow: 0 0 0 0 rgba(245,101,101,0); }
            }
          `}</style>
        </Box>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          w="350px"
          bg={popoverBg}
          boxShadow={popoverShadow}
          borderRadius="2xl"
          p={0}
          maxW="95vw"
        >
          <Box px={5} pt={4} pb={2} borderBottom="1px solid #e2e8f0" display="flex" alignItems="center" justifyContent="space-between">
            <Text fontWeight="bold">Notifications ({notifications.length})</Text>
            {unread.length > 0 && (
              <Button size="xs" variant="ghost" colorScheme="teal" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </Box>
          <Box px={5} pt={3} pb={1} display="flex" gap={2}>
            <button
              onClick={() => setTab("all")}
              style={tabBtn(tab === "all", "#319795", "#e6fffa")}
              aria-selected={tab === "all"}
            >
              All
            </button>
            <button
              onClick={() => setTab("unread")}
              style={tabBtn(tab === "unread", "#b7791f", "#fefcbf")}
              aria-selected={tab === "unread"}
            >
              Unread
            </button>
            <button
              onClick={() => setTab("action")}
              style={tabBtn(tab === "action", "#b7791f", "#fbd38d")}
              aria-selected={tab === "action"}
            >
              Requires Action
            </button>
          </Box>
          <Box px={2} py={2} maxH="320px" overflowY="auto">
            {renderTabContent()}
          </Box>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
} 