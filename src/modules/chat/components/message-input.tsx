"use client";

import {
  useState,
} from "react";

interface Props {
  onSend(
    message: string
  ): Promise<void>;
}

export function MessageInput({
  onSend,
}: Props) {

  const [
    message,
    setMessage,
  ] = useState("");

  async function submit() {

    if (!message.trim())
      return;

    await onSend(message);

    setMessage("");
  }

  return (
    <div className="border-t p-4">

      <textarea
        value={message}
        onChange={e =>
          setMessage(
            e.target.value
          )
        }
      />

      <button
        onClick={submit}
      >
        Send
      </button>

    </div>
  );
}