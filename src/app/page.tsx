"use client";

import { useChat } from "@ai-sdk/react";
import { SendHorizonalIcon } from "lucide-react";
import { FormEvent, useState, useEffect, useRef } from "react";
import Image from "next/image";
import "./styles/chatAnimations.css";

export default function Chat() {
  const { messages, input, setInput, handleInputChange, handleSubmit } =
    useChat({
      api: "/api/floristAi/completion",
    });

  const stripFormatting = (text: string): string => {
    return text.replace(/(\*)/g, "");
  };

  const formRef = useRef<HTMLFormElement>(null);

  const customHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setInput("");
  };

  return (
    <div className="flex flex-col mt-14 items-center w-[100%] h-[80vh]">
      <div className="flex justify-center items-center text-center text-4xl text-black">
        <span className="hidden sm:block">Welcome to Flowershop.ai</span>
        <div className="hidden sm:block"></div>
        <span className="block sm:hidden">Hey there!</span>
      </div>

      <p className="text-left mt-6 text-gray-500 text-xl">
        Generate AI-powered images with custom prompts!
      </p>

      <div className="mt-4 w-[80%] sm:w-[60%] text-md">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`my-2 text-md py-4 px-8 rounded-lg w-fit ${
              m.role === "user"
                ? "ml-auto bg-blue-100 text-blue-900 slide-in-right"
                : "mr-auto mb-10 bg-gray-100 text-gray-900 slide-in-left"
            }`}
            style={{ whiteSpace: "pre-line" }}
          >
            {m.toolInvocations
              ? m.toolInvocations.map((ti) =>
                  ti.toolName === "generateImage" ? (
                    ti.state === "result" ? (
                      <div key={ti.toolCallId}>
                        <Image
                          src={`data:image/png;base64,${ti.result.image}`}
                          alt={ti.result.prompt}
                          width={400}
                          height={400}
                          className="max-w-[512px] rounded-lg mb-2"
                        />
                        <p>{stripFormatting(ti.result.prompt)}</p>
                      </div>
                    ) : (
                      <div key={ti.toolCallId} className="animate-pulse">
                        Generating image...
                      </div>
                    )
                  ) : null
                )
              : stripFormatting(m.content)}
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        className="flex py-4 px-8 w-[80%] sm:w-[60%] border-2 border-black rounded-xl mb-0 mt-10"
        onSubmit={customHandleSubmit}
      >
        <input
          name="prompt"
          className="h-8 w-[100%] text-black border-black focus:outline-none"
          value={input}
          onChange={handleInputChange}
          id="prompt"
          placeholder="Enter your prompt..."
        />
        <button type="submit">
          <SendHorizonalIcon className="text-black" />
        </button>
      </form>
    </div>
  );
}
