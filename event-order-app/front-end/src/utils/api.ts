export const getUserData = async (token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/auth`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return {
      status: false,
      code: 404,
      message: "",
    };
  }

  return res.json();
};
