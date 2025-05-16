// services/eventService.ts
import axios from "axios";

export const fetchEvents = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error("Gagal mengambil data events");
  }
};
