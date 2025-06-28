import { format } from "date-fns"

export function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ")
}

export const formatDate = (date: string | Date | undefined) => {
  if (!date) return "N/A"
  try {
    return format(new Date(date), "PPP")
  } catch (e) {
    return "Invalid Date"
  }
}
