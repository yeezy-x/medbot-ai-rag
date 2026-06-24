export async function apiClient<T>(
  input: RequestInfo,
  init?: RequestInit
) {
  const response =
    await fetch(
      input,
      init
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Invalid response"
    );
  }

  return data as T;
}