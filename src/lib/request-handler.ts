import { NextResponse }
from "next/server";

import { handleError }
from "./error-handler";

export async function requestHandler(
  callback: () => Promise<unknown>
) {
  try {
    const data =
      await callback();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const handled =
      handleError(error);

    return NextResponse.json(
      handled.body,
      {
        status:
          handled.status,
      }
    );
  }
}