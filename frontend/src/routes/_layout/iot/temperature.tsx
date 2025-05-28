import { Box, Container, Text, Flex, Heading, Icon, Button } from "@chakra-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiThermometer, FiArrowLeft } from "react-icons/fi"
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
import { useSensorData } from "@/hooks/useSensorData"

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

export const Route = createFileRoute("/_layout/iot/temperature")({
  component: TemperatureDetail,
})

function TemperatureDetail() {
  const { data: temperatureData, isLoading: isTemperatureLoading } = useSensorData('temperature')

  // Generate sample data for 24 hours
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [22, 23, 22, 21, 20, 19, 20, 21, 22, 23, 24, 25, 26, 25, 24, 23, 22, 21, 20, 21, 22, 23, 24, 25],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temperature Over Last 24 Hours',
      },
    },
    scales: {
      y: {
        min: 15,
        max: 30,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Hour'
        }
      }
    }
  }

  return (
    <Box>
      <Flex 
        align="center" 
        h="120px" 
        px={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
      >
        <Link to="/iot">
          <Button 
            variant="ghost" 
            mr={4}
            _hover={{ bg: 'gray.100' }}
          >
            <Icon as={FiArrowLeft} mr={2} />
            Back to Dashboard
          </Button>
        </Link>
        <Flex align="center" gap={3}>
          <Icon as={FiThermometer} boxSize={8} color="red.500" />
          <Heading size="lg">Temperature Details</Heading>
        </Flex>
      </Flex>

      <Box p={4}>
        <Box p={6} bg="white" borderRadius="lg" shadow="sm" h="400px">
          <Line options={options} data={data} />
        </Box>

        <Box mt={6} p={6} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Temperature Statistics</Heading>
          <Flex gap={6} wrap="wrap">
            <Box>
              <Text color="gray.500" fontSize="sm">Current Temperature</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {isTemperatureLoading ? "Loading..." : `${temperatureData?.value}°C`}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Last Updated</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {isTemperatureLoading ? "..." : new Date(temperatureData?.timestamp || "").toLocaleTimeString()}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Highest Temperature</Text>
              <Text fontSize="2xl" fontWeight="bold">26°C</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Lowest Temperature</Text>
              <Text fontSize="2xl" fontWeight="bold">19°C</Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default TemperatureDetail 