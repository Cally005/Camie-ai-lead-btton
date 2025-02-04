"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  const [bookMeeeting, setBookMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const [dynamicText, setDynamicText] = useState("");
  const [setUpMessage, setSetUpMessage] = useState(
    "Loading chat environment..."
  );
  const [ctaText, setCtaText] = useState("Book Appointment"); // Default fallback
  const messagesContainerRef = useRef(null);
  const { resolvedTheme, setTheme } = useTheme();

  const callAiChatEndpoint = async (body) => {
    return await axios.post(
      "https://camie-ai.onrender.com/api/v0/ai/chat",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };

  // Function to get initial message from AI
  const getInitialMessage = async (threadId) => {
    try {
      setLoading(true);
      const response = await callAiChatEndpoint({
        action: "start-stream",
        thread_id: threadId,
        question: "Hello, Good Day",
        campaign_id,
      });

      let aiResponse =
        response.data?.data?.text?.value ||
        response.data?.data?.text ||
        response.data?.text ||
        "Hello! I'm here to help you today. What would you like to discuss?";

      setMessages([{ user: false, text: aiResponse }]);
      setHideHeader(true);
    } catch (error) {
      console.error("Error getting initial message:", error);
      setMessages([
        {
          user: false,
          text: "Hello! I'm here to help you today. What would you like to discuss?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function displayLoadingMessage() {
      // Update message every 2 seconds
      const interval = setInterval(() => {
        setSetUpMessage(getRandomLoadingMessage());
      }, 2000);

      if (threadId) {
        clearInterval(interval);
      }
    }

    displayLoadingMessage();
  }, [threadId]);

  // Modified useEffect to create thread and get initial message
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await callAiChatEndpoint({
          action: "create-thread",
          campaign_id,
        });

        if (response.data.status) {
          const newThreadId = response.data.data.id;
          setThreadId(newThreadId);
          // await getInitialMessage(newThreadId);
        } else {
          console.error("Thread ID creation failed:", response.data);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, []);

  const callCamieAIChatAPI = async (userMessage) => {
    console.log("Calling Camie AI Chat API with message:", userMessage);
    if (!threadId) {
      console.error("Thread ID not available");
      return;
    }

    try {
      setLoading(true);

      const response = await callAiChatEndpoint({
        action: "start-stream",
        thread_id: threadId,
        question: userMessage,
        campaign_id,
      });

      console.log("API Response:", response.data);
      let aiResponse =
        response.data?.data?.text?.value ||
        response.data?.data?.text ||
        response.data?.text ||
        "I'm sorry, but I couldn't generate a response.";

      console.log("response:", aiResponse);

      if (response.data.data.bookMeeting === true) {
        aiResponse = "I will open a modal to book the meeting, in a few.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: false, text: aiResponse },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        aiResponse = "Let me know when you are done.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: false, text: aiResponse },
        ]);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        setBookMeeting(true);
        setLoading(false);

        return;
      }

      setLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: false, text: aiResponse },
      ]);
    } catch (error) {
      console.error("Error calling Camie AI Chat API:", error);

      setLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: false,
          text: "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    }
  };

  // Fetch CTA text once
  useEffect(() => {
    const fetchCtaText = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/call-to-action",
          { campaign_id },
          { headers: { "Content-Type": "application/json" } }
        );
        setCtaText(response.data.data.call_to_action || "Book Appointment");
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch CTA text:", error);
        setCtaText(response.data.data.call_to_action);
      }
    };

    fetchCtaText();
  }, []);

  const handleSelection = () => {
    setBookMeeting(true);
  };

  const handleSendMessage = () => {
    if (loading || !inputText.trim()) return;

    if (!hideHeader) setHideHeader(true);

    const newMessage = { user: true, text: inputText };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    callCamieAIChatAPI(inputText);

    setInputText("");
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

    // Get a random index
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);

    // Return the random message
    return loadingMessages[randomIndex];
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
                    src="/src/assets/love.gif"
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
                            style={{ color: "white" }}
                            className="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                            {...props}
                          />
                        ) : (
                          <pre
                            style={{ color: "white" }}
                            className="bg-gray-200 dark:bg-gray-600 p-2 rounded mb-2 overflow-x-auto"
                          >
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

          {!threadId && (
            <div className="flex justify-center items-center">
              <span>{setUpMessage}</span>{" "}
            </div>
          )}

          {loading && (
            <div className="flex justify-start items-center gap-3">
              <img
                src="/src/assets/love.gif"
                alt="AI"
                className="w-8 h-8 rounded-full "
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

        <div className="p-4 border-t">
          {threadId && (
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
            onClick={() => handleSelection()}
            className="w-full bg-primary text-white py-2 px-4 mt-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            {ctaText}
          </button>
        </div>
      </div>
      <Modal
        isOpen={bookMeeeting}
        setOpen={setBookMeeting}
        className="absolute w-full h-full"
      />
    </main>
  );
}
