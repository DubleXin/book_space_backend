import axios from "axios";

const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL || "http://api-profile:6000";

export async function getUserStars(userId: number) {
  const { data } = await axios.get(`${PROFILE_SERVICE_URL}/api/star/${userId}`);

  return data?.data || [];
}

export async function getUserReviews(userId: number) {
  const { data } = await axios.get(
    `${PROFILE_SERVICE_URL}/api/review/${userId}`
  );
  return data?.data || [];
}
