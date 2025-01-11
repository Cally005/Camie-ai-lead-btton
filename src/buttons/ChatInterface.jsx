"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Moon, Sun } from "lucide-react";
import Modal from "@/components/app/MeetingModal";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [bookMeeeting, setBookMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const [dynamicText, setDynamicText] = useState("");
  const [ctaText, setCtaText] = useState("Book Appointment"); // Default fallback
  const messagesContainerRef = useRef(null);
  const { resolvedTheme, setTheme } = useTheme();

  // Function to get initial message from AI
  const getInitialMessage = async (threadId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://camie-ai.onrender.com/api/v0/ai/chat",
        {
          action: "start-stream",
          campaign_id: "29e4fed1-de1b-474e-8e0e-a3bbd21a7d76",
          thread_id: threadId,
          question: "start_conversation", // Special trigger for initial message
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

  // Modified useEffect to create thread and get initial message
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/chat",
          {
            action: "create-thread",
            campaign_id: "29e4fed1-de1b-474e-8e0e-a3bbd21a7d76",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status) {
          const newThreadId = response.data.data.id;
          setThreadId(newThreadId);
          await getInitialMessage(newThreadId);
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

      const response = await axios.post(
        "https://camie-ai.onrender.com/api/v0/ai/chat",
        {
          action: "start-stream",
          thread_id: threadId,
          question: userMessage,
          campaign_id: "29e4fed1-de1b-474e-8e0e-a3bbd21a7d76",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
          { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
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
          className="flex-1 overflow-y-auto p-4 space-y-4"
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
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          ))}

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

// "use client";

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Send, Moon, Sun } from "lucide-react";
// import Modal from "@/components/app/MeetingModal";

// export default function ChatInterface() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const [bookMeeeting, setBookMeeting] = useState(false);
//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const { resolvedTheme, setTheme } = useTheme();

//   // Create thread on component mount
//   useEffect(() => {
//     const createThread = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/chat",
//           {
//             action: "create-thread",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data.status) {
//           setThreadId(response.data.data.id);
//         } else {
//           console.error("Thread ID creation failed:", response.data);
//         }
//       } catch (error) {
//         console.error("Error creating thread:", error);
//       }
//     };

//     createThread();
//   }, []);

//   const callCamieAIChatAPI = async (userMessage) => {
//     console.log("Calling Camie AI Chat API with message:", userMessage);
//     if (!threadId) {
//       console.error("Thread ID not available");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://camie-ai.onrender.com/api/v0/ai/chat",
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: userMessage,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("API Response:", response.data);
//       // Safely extract the AI response
//       let aiResponse =
//         response.data?.data?.text?.value ||
//         response.data?.data?.text ||
//         response.data?.text ||
//         "I'm sorry, but I couldn't generate a response.";

//       console.log("response:", aiResponse);

//       if (response.data.data.bookMeeting === true) {
//         aiResponse = "I will open a modal to book the meeting, in a few.";
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { user: false, text: aiResponse },
//         ]);
//         await new Promise((resolve) => setTimeout(resolve, 1500));
//         aiResponse = "Let me know when you are done.";
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { user: false, text: aiResponse },
//         ]);

//         await new Promise((resolve) => setTimeout(resolve, 3000));

//         setBookMeeting(true);
//         setLoading(false);

//         return;
//       }

//       // Stop loading and add AI message
//       setLoading(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { user: false, text: aiResponse },
//       ]);
//     } catch (error) {
//       console.error("Error calling Camie AI Chat API:", error);

//       setLoading(false);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           user: false,
//           text: "Sorry, there was an error processing your request. Please try again.",
//         },
//       ]);
//     }
//   };

//   const handleSendMessage = () => {
//     if (loading || !inputText.trim()) return;

//     if (!hideHeader) setHideHeader(true);

//     const newMessage = { user: true, text: inputText };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);

//     callCamieAIChatAPI(inputText);

//     setInputText("");
//   };

//   // Scroll to bottom effect
//   useEffect(() => {
//     if (messagesEndRef.current && messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop =
//         messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, loading]);

//   return (
//     <main className="relative w-full h-full">
//       <div className="flex flex-col w-full h-full">
//         {!hideHeader && (
//           <div className="p-4 text-center border-b">
//             <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
//             <p className="text-sm text-muted-foreground">
//               How can I help you today?
//             </p>
//           </div>
//         )}

//         {/* Messages Container with Constrained Scrolling */}
//         <div
//           ref={messagesContainerRef}
//           className="flex-1 overflow-y-auto p-4 space-y-4"
//           style={{
//             maxHeight: "calc(100% - 120px)",
//             overflowY: "auto",
//           }}
//         >
//           {messages.map((message, index) => (
//             <div
//               key={index}
//               className={`flex ${
//                 message.user ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div className="flex items-start gap-3 max-w-[90%]">
//                 {!message.user && (
//                   <img
//                     src="src/assets/camie_logo.png"
//                     alt="AI"
//                     className="w-8 h-8 rounded-full shrink-0"
//                   />
//                 )}
//                 <div
//                   className={`
//                 max-w-full p-3 rounded-lg break-words
//                 ${
//                   message.user
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-muted text-foreground"
//                 }
//               `}
//                 >
//                   <p>{message.text}</p>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="flex justify-start items-center gap-3">
//               <img
//                 src="src/assets/camie_logo.png"
//                 alt="AI"
//                 className="w-8 h-8 rounded-full animate-rotate"
//               />
//               <div className="space-y-2 w-full max-w-xs">
//                 <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] animate-animate rounded"></div>
//                 <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-5/6"></div>
//                 <div className="h-3 bg-gradient-to-r from-indigo-500 via-black to-blue-500 bg-[length:200%_100%] rounded animate-animate w-4/6"></div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 border-t">
//           <div className="relative">
//             <Input
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               onKeyDown={(e) => {
//                 if (loading && e.key === "Enter") {
//                   e.preventDefault();
//                   return;
//                 }
//                 if (e.key === "Enter") handleSendMessage();
//               }}
//               placeholder="Ask Camie..."
//               disabled={loading}
//               className={`pr-20 ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             />
//             <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() =>
//                   setTheme(resolvedTheme === "dark" ? "light" : "dark")
//                 }
//                 className="hover:bg-accent"
//               >
//                 {resolvedTheme === "dark" ? (
//                   <Sun className="h-5 w-5" />
//                 ) : (
//                   <Moon className="h-5 w-5" />
//                 )}
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleSendMessage}
//                 disabled={!inputText.trim() || loading}
//                 className={`hover:bg-primary/10 ${
//                   loading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 <Send className="h-5 w-5 text-primary" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Modal remains the same */}
//       </div>
//       <Modal
//         isOpen={bookMeeeting}
//         setOpen={setBookMeeting}
//         className="absolute  w-full h-full"
//       />
//     </main>
//   );
// }
