export default function getErrorMessage(error) {
  if (!error) return "Something went wrong";

  // Axios error with response
  if (error.response) {
    const data = error.response.data;

    return (
      data?.message ||   // ✅ your backend standard
      data?.error ||     // fallback
      data?.msg ||       // fallback
      "Request failed"
    );
  }

  // Network / unknown error
  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}