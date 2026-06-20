export async function apiClient<T>(
  input: RequestInfo,
  init?: RequestInit
) {
  const response =
    await fetch(
      input,
      init
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message
    );
  }

  return data as T;
}