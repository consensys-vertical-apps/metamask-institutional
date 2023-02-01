import { ExtensionDashboardResponse } from "./interfaces/ExtensionDashboardResponse";

export async function setDashboardCookie(
  mmiDashboardData: ExtensionDashboardResponse,
  cookieSetUrls: string[],
): Promise<boolean> {
  try {
    const promiseArray = cookieSetUrls.map(url =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(mmiDashboardData),
      }),
    );
    await Promise.all(promiseArray);
    return true;
  } catch (e) {
    console.log("Error setting dashboard cookie:", e.message, e.stack, e.response);
    return false;
  }
}
