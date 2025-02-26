"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Moon, Sun } from "lucide-react";
import Modal from "@/components/app/MeetingModal";
import ReactMarkdown from "react-markdown";

export function ChatInterface({ campaign_id }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [bookMeeting, setBookMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const [setUpMessage, setSetUpMessage] = useState(
    "Loading chat environment..."
  );
  const [ctaText, setCtaText] = useState("Book Appointment");
  const messagesContainerRef = useRef(null);
  const { resolvedTheme, setTheme } = useTheme();

  const callAiChatEndpoint = async (body) => {
    const response = await fetch(
      "https://camie-ai.onrender.com/api/v0/ai/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return response;
  };

  useEffect(() => {
    function displayLoadingMessage() {
      const interval = setInterval(() => {
        setSetUpMessage(getRandomLoadingMessage());
      }, 2000);

      if (threadId) {
        clearInterval(interval);
      }
    }

    displayLoadingMessage();
  }, [threadId]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await callAiChatEndpoint({
          action: "create-thread",
          campaign_id,
        });

        console.log(response);

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const messages = chunk.split("\n").filter(Boolean);

          for (const message of messages) {
            const data = JSON.parse(message);

            if (data.type === "init") {
              // Set the thread ID when we receive the init message
              setThreadId(data.threadId);
            } else if (data.type === "message") {
              setMessages([{ user: false, text: data.content }]);
            }
          }
        }
      } catch (error) {
        console.log(error);
        // console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, [campaign_id]);

  const fetchCtaText = async () => {
    try {
      const response = await fetch(
        "https://camie-ai.onrender.com/api/v0/ai/call-to-action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ campaign_id }),
        }
      );
      const data = await response.json();
      setCtaText(data.data.call_to_action || "Book Appointment");
    } catch (error) {
      console.error("Failed to fetch CTA text:", error);
    }
  };

  useEffect(() => {
    fetchCtaText();
  }, [campaign_id]);

  const handleStreamResponse = async (response) => {
    const reader = response.body.getReader();
    let currentMessage = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            console.log(data);

            switch (data.type) {
              case "init":
                setThreadId(data.threadId);
                break;

              case "message":
                if (!currentMessage) {
                  // Add new message if this is the first chunk
                  setMessages((prev) => [
                    ...prev,
                    { user: false, text: data.content },
                  ]);
                } else {
                  // Update existing message
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = data.content;
                    return newMessages;
                  });
                }
                currentMessage = data.content;

                if (data.content) {
                  setLoading(false);
                }
                break;

              case "function":
                if (data.name === "bookMeeting") {
                  console.log(messages[messages.length]);
                  console.log(messages.length);
                  if (
                    messages[messages.length] !=
                    "I'll help you open a modal to book a meeting right away."
                  ) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        user: false,
                        text: "I'll help you open a modal to book a meeting right away.",
                      },
                    ]);
                  }
                  setTimeout(() => setBookMeeting(true), 1000);
                  setLoading(false);
                }
                break;
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      }
    } catch (error) {
      console.error("Stream reading error:", error);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { user: false, text: "Sorry, there was an error. Please try again." },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (loading || !inputText.trim()) return;

    setLoading(true);
    const messageText = inputText.trim();
    setMessages((prev) => [...prev, { user: true, text: messageText }]);
    setInputText("");

    try {
      const response = await callAiChatEndpoint({
        action: "start-stream",
        thread_id: threadId,
        question: messageText,
        campaign_id,
      });

      if (!response.ok) throw new Error("Network response was not ok");
      await handleStreamResponse(response);
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { user: false, text: "Sorry, there was an error. Please try again." },
      ]);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function getRandomLoadingMessage() {
    const loadingMessages = [
      "Getting the chat room ready...",
      "Warming up the servers...",
      "Preparing your chat experience...",
      "Setting up secure connections...",
      "Almost there! Just a few more seconds...",
      "Loading chat environment...",
      "Connecting to chat servers...",
      "Initializing chat features...",
      "Making sure everything is perfect...",
      "Polishing the chat interface...",
      "Double-checking security protocols...",
      "Optimizing your chat experience...",
      "Loading final components...",
      "Setting up encryption...",
      "Configuring chat settings...",
    ];
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  }

  return (
    <main className="relative w-full h-full">
      <div className="flex flex-col w-full h-full">
        {!hideHeader && (
          <div className="p-4 text-center border-b">
            <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
            <p className="text-sm text-muted-foreground">
              How can I help you today?
            </p>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 pl-0 space-y-4"
          style={{
            maxHeight: "calc(100% - 120px)",
            overflowY: "auto",
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.user ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-start gap-3 max-w-[90%]">
                {!message.user && (
                  <img
                    src="https://camie-ace.github.io/camie-animated-box/love.gif"
                    alt="AI"
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                )}
                <div
                  className={`
                    max-w-full p-3 rounded-lg break-words
                    ${
                      message.user
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }
                  `}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-2" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc ml-4 mb-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-4 mb-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-xl font-bold mb-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg font-bold mb-2" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-md font-bold mb-2" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-md mb-2 underline" {...props} />
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code
                            className="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                            {...props}
                          />
                        ) : (
                          <pre className="bg-gray-200 dark:bg-gray-600 p-2 rounded mb-2 overflow-x-auto">
                            <code {...props} />
                          </pre>
                        ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {!threadId ||
            (messages.length <= 0 && (
              <div className="flex justify-center items-center">
                <span>{setUpMessage}</span>
              </div>
            ))}

          {/* loading animation  */}
          {loading && (
            <div className="flex justify-start items-center gap-3">
              <img
                src="https://camie-ace.github.io/camie-animated-box/love.gif"
                alt="AI"
                className="w-8 h-8 rounded-full"
              />
              <div className="space-y-2 w-full max-w-xs">
                <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] animate-animate rounded"></div>
                <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-5/6"></div>
                <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-4/6"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* inout field  */}
        <div className="p-4 border-t">
          {threadId && messages.length >= 1 && (
            <div className="relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (loading && e.key === "Enter") {
                    e.preventDefault();
                    return;
                  }
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask Camie..."
                disabled={loading}
                className={`pr-20 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="hover:bg-accent"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || loading}
                  className={`hover:bg-primary/10 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Send className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
          )}
          <button
            onClick={() => setBookMeeting(true)}
            className="w-full bg-primary text-white py-2 px-4 mt-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            {ctaText}
          </button>
        </div>
      </div>
      <Modal
        isOpen={bookMeeting}
        setOpen={setBookMeeting}
        className="absolute w-full h-full"
      />
    </main>
  );
}
