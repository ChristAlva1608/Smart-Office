import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  HStack,
  useClipboard,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Field } from "../ui/field"
import { useColorModeValue } from "@/components/ui/color-mode"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserPublic>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name,
      email: currentUser?.email,
    },
  })
  const [coreiotToken, setCoreiotToken] = useState(currentUser?.coreiot_access_token || "")
  const [savingToken, setSavingToken] = useState(false)
  const [tokenMessage, setTokenMessage] = useState("")
  const { value: clipboardValue, setValue } = useClipboard({ value: coreiotToken })
  const hasCopied = clipboardValue === coreiotToken
  const handleCopy = () => setValue(coreiotToken)

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    toggleEditMode()
  }

  const handleSaveToken = async () => {
    setSavingToken(true)
    setTokenMessage("")
    try {
      await UsersService.updateCoreiotTokenMe({ requestBody: { coreiot_access_token: coreiotToken } })
      setTokenMessage("Token saved!")
      queryClient.invalidateQueries()
    } catch (e) {
      setTokenMessage("Failed to save token.")
    }
    setSavingToken(false)
  }

  // Avatar fallback: use initials in a circle
  const initials = currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <Container maxW="lg" py={8}>
      <Box boxShadow="lg" borderRadius="xl" bg={useColorModeValue('white', 'gray.800')} p={8}>
        <Flex align="center" direction="column" gap={2} mb={4}>
          <Box bg="teal.500" color="white" borderRadius="full" w={20} h={20} display="flex" alignItems="center" justifyContent="center" fontSize="2xl" fontWeight="bold" mb={2}>
            {initials}
          </Box>
          <Heading size="md" textAlign="center">{currentUser?.full_name || "N/A"}</Heading>
          <Text color="gray.500" fontSize="sm">{currentUser?.email}</Text>
        </Flex>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Full name">
            {editMode ? (
              <Input
                {...register("full_name", { maxLength: 30 })}
                type="text"
                size="md"
              />
            ) : (
              <Text fontSize="md" py={2} color={!currentUser?.full_name ? "gray" : "inherit"}>
                {currentUser?.full_name || "N/A"}
              </Text>
            )}
          </Field>
          <Field mt={4} label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
            {editMode ? (
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                type="email"
                size="md"
              />
            ) : (
              <Text fontSize="md" py={2}>{currentUser?.email}</Text>
            )}
          </Field>
          <Field mt={4} label="CoreIoT Access Token">
            <HStack>
              <Input
                type="text"
                value={coreiotToken}
                onChange={e => setCoreiotToken(e.target.value)}
                size="md"
                pr="4.5rem"
                readOnly={!editMode}
              />
              <Button onClick={handleCopy} size="sm" variant="outline" colorScheme={hasCopied ? "green" : "gray"} type="button">
                {hasCopied ? "Copied" : "Copy"}
              </Button>
            </HStack>
            <Button mt={2} colorScheme="teal" onClick={handleSaveToken} loading={savingToken} w="full" type="button">
              Save Token
            </Button>
            {tokenMessage && (
              <Text mt={2} color={tokenMessage === "Token saved!" ? "green.500" : "red.500"}>{tokenMessage}</Text>
            )}
          </Field>
          <Flex mt={6} gap={3} justify="flex-end">
            <Button
              colorScheme={editMode ? "teal" : "gray"}
              onClick={toggleEditMode}
              type={editMode ? "button" : "submit"}
              loading={editMode ? isSubmitting : false}
              disabled={editMode ? !isDirty || !getValues("email") : false}
            >
              {editMode ? "Save" : "Edit"}
            </Button>
            {editMode && (
              <Button
                variant="outline"
                colorScheme="gray"
                onClick={onCancel}
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </Button>
            )}
          </Flex>
        </Box>
      </Box>
    </Container>
  )
}

export default UserInformation
