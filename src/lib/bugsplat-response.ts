import { BugSplatResponse } from "bugsplat";

export interface BugSplatResponseData {
  success: boolean;
  message: string;
  current_server_time: number;
  url: string;
  crash_id: number;
}

const defaultResponseData: BugSplatResponseData = {
  success: false,
  message: "",
  current_server_time: 0,
  url: "",
  crash_id: 0,
};

function validateResponseData(responseData: BugSplatResponseData) {
  const keysToValidate: (keyof BugSplatResponseData)[] = [
    "success",
    "message",
    "current_server_time",
    "url",
    "crash_id",
  ];
  keysToValidate.forEach((key) => {
    if (responseData[key] === null) {
      throw new Error(`BugsplatResponseData Error: ${key} cannot be null.`);
    }
  });
}

export function parseResponseData({
  error,
  response,
}: BugSplatResponse): BugSplatResponseData {
  if (error) {
    return {
      ...defaultResponseData,
      success: false,
      message: error.message,
    };
  }
  return {
    success: response.status === "success",
  };
}
