export async function handleResponse(response: Response, contextMessage?: string): Promise<any> {
  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    const errorMsg = `Failed to parse JSON. Status: ${response.status} ${response.statusText}. ${contextMessage || ""}`;
    console.error(errorMsg, { headers: response.headers, url: response.url });
    throw new Error(errorMsg);
  }

  if (!response.ok) {
    let errorMsg = `Error with request. Status: ${response.status} Status text: ${response.statusText}`;
    if (data.error && data.error.message) {
      errorMsg += `. Error message: ${data.error.message}`;
    } else if (data.message) {
      errorMsg += `. Error message: ${data.message}`;
    }
    errorMsg += contextMessage ? ` Context: ${contextMessage}` : "";
    console.error(errorMsg, { headers: response.headers, url: response.url });
    throw new Error(errorMsg);
  }

  return data;
}
