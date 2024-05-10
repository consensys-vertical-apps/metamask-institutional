export async function handleResponse(response: Response, contextErrorMessage?: string): Promise<any> {
  let errorMsg = `Error with request. Status: ${response.status} Status text: ${response.statusText}. ${contextErrorMessage}`;

  if (!response.ok) {
    try {
      const errorData = await response.json();
      errorMsg += errorData.error?.message ? `. Error message: ${errorData.error.message}` : `. Error message: ${errorData.message}`;
      console.error(errorMsg, { headers: response.headers, url: response.url });
      throw new Error(errorMsg);
    } catch (error) {
      errorMsg = `Failed to parse JSON. ${errorMsg}`;
      console.error(errorMsg, { headers: response.headers, url: response.url });
      throw new Error(errorMsg);
    }
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    errorMsg = `Failed to parse JSON. ${errorMsg}`;
    console.error(errorMsg, { headers: response.headers, url: response.url });
    throw new Error(errorMsg);
  }
}
