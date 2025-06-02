import { Box, Text, Flex, Heading, Icon, Button, SimpleGrid } from "@chakra-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiDroplet, FiArrowLeft } from "react-icons/fi"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useSensorData, useDailySensorData } from "@/hooks/useSensorData"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export const Route = createFileRoute("/_layout/iot/humidity")({
  component: HumidityDetail,
})

function formatTimeLabel(timestamp: string) {
  // Ensure the timestamp is parsed as UTC
  const safeTimestamp = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
  const date = new Date(safeTimestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}

function HumidityDetail() {
  const { data: latestData, isLoading: isLatestLoading } = useSensorData('humidity')
  const { data: dailyHumidityData, isLoading: isDailyLoading } = useDailySensorData('humidity')

  const chartData = {
    labels: dailyHumidityData?.map(point => formatTimeLabel(point.timestamp)) || [],
    datasets: [
      {
        label: 'Humidity',
        data: dailyHumidityData?.map(point => point.value) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333',
          font: { size: 14, weight: 600 }
        }
      },
      title: {
        display: true,
        text: 'Humidity Over Last 24 Hours',
        font: { size: 22, weight: 700 }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.parsed.y.toLocaleString()}% at ${context.label}`,
        }
      }
    },
    layout: {
      padding: 24
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Humidity (%)',
          color: '#333',
          font: { size: 16 }
        },
        ticks: {
          color: '#333',
          font: { size: 14 },
          callback: (tickValue: string | number) => Number(tickValue).toLocaleString()
        },
        grid: {
          color: '#eee'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#333',
          font: { size: 16 }
        },
        ticks: {
          color: '#333',
          font: { size: 14 },
          maxTicksLimit: 8,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          color: '#eee'
        }
      }
    }
  }

  if (isLatestLoading || isDailyLoading) {
    return <div>Loading humidity data...</div>
  }

  // Calculate min and max from daily data
  const values = dailyHumidityData?.map(point => point.value) || []
  const maxHumidity = values.length > 0 ? Math.max(...values) : 0
  const minHumidity = values.length > 0 ? Math.min(...values) : 0

  return (
    <Box>
      {/* Header */}
      <Flex
        align="center"
        h="80px"
        px={{ base: 2, md: 6 }}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        gap={4}
      >
        <Link to="/iot">
          <Button variant="ghost" _hover={{ bg: 'gray.100' }}>
            <Icon as={FiArrowLeft} mr={2} />
            Back to Dashboard
          </Button>
        </Link>
        <Flex align="center" gap={2}>
          <Icon as={FiDroplet} boxSize={7} color="blue.500" />
          <Heading size="md">Humidity Details</Heading>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Box p={{ base: 2, md: 6 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Chart */}
          <Box
            bg="gray.50"
            borderRadius="xl"
            shadow="md"
            p={{ base: 4, md: 8 }}
            minH="400px"
            height="400px"
            display="flex"
            flexDir="column"
            justifyContent="center"
            aria-label="Humidity line chart"
          >
            {dailyHumidityData?.length === 0 ? (
              <Flex align="center" justify="center" height="100%">
                <Text color="gray.400">No data available for the last 24 hours.</Text>
              </Flex>
            ) : (
              <Line data={chartData} options={options} style={{ height: '100%' }} />
            )}
          </Box>

          {/* Statistics */}
          <Box bg="white" borderRadius="lg" shadow="sm" p={6} display="flex" flexDir="column" justifyContent="center">
            <Heading size="md" mb={4}>Humidity Statistics</Heading>
            <SimpleGrid columns={2} gap={4}>
              <Box>
                <Text color="gray.500" fontSize="sm">Current Humidity</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {latestData ? `${Number(latestData.value).toFixed(2)}%` : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Last Updated</Text>
                <Text fontSize="xl" fontWeight="semibold">
                  {latestData ? new Date(latestData.timestamp).toLocaleTimeString("en-US", {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  }) : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Highest Humidity</Text>
                <Text fontSize="2xl" fontWeight="bold">{maxHumidity !== 0 ? maxHumidity.toFixed(2) : 0}%</Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Lowest Humidity</Text>
                <Text fontSize="2xl" fontWeight="bold">{minHumidity !== 0 ? minHumidity.toFixed(2) : 0}%</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default HumidityDetail 