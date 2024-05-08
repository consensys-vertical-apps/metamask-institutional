export async function handleResponse(response: Response, contextMessage?: string): Promise<any> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      let errorMsg = `Error with request. Status: ${response.status} Status text: ${response.statusText}`;
      if (errorData.error && errorData.error.message) {
        errorMsg += `. Error message: ${errorData.error.message}`;
      } else if (errorData.message) {
        errorMsg += `. Error message: ${errorData.message}`;
      }
      errorMsg += contextMessage ? ` Context: ${contextMessage}` : "";
      console.error(errorMsg, { headers: response.headers, url: response.url });
      throw new Error(errorMsg);
    } catch (error) {
      const fallbackErrorMsg = `Failed to parse JSON from a non-OK response. Status: ${response.status} ${response.statusText}. ${contextMessage || ""}`;
      console.error(fallbackErrorMsg, { headers: response.headers, url: response.url });
      throw new Error(fallbackErrorMsg);
    }
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    const errorMsg = `Failed to parse JSON. Status: ${response.status} ${response.statusText}. ${contextMessage || ""}`;
    console.error(errorMsg, { headers: response.headers, url: response.url });
    throw new Error(errorMsg);
  }
}
