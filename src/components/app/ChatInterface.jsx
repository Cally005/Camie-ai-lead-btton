
//most recent working code 
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Moon, Sun } from "lucide-react";
import Modal from "@/components/app/MeetingModal";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Booking Form Component
export function BookingForm({ open, onOpenChange, onSubmit, chatTheme, setChatTheme  }) {
  const [formData, setFormData] = useState({
    name: '',
    primary_email: '',
    campaign_id: "7ff77bf9-c7e2-4de7-926c-fa7b10d4eda9",
    lead_source:"camie_pixels",
    company_id:"bb5e2249-b1e8-4c61-af78-27832445fa3c",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/v0/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md chat-modal ${
      chatTheme === "dark" ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}>
        <DialogHeader>
          <DialogTitle>Book Your Appointment</DialogTitle>
          <DialogDescription>
            Enter your details to book an appointment with Camie Pixel.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.primary_email}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_email: e.target.value }))}
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Book Now
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChatInterface({ campaign_id, chatTheme, setChatTheme }) {
  const [isModalDark, setIsModalDark] = useState(false);  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [bookMeeting, setBookMeeting] = useState(false);
  const messagesEndRef = useRef(null);
  const [setUpMessage, setSetUpMessage] = useState(
    "Loading chat environment..."
  );
  const [ctaText, setCtaText] = useState("Book Appointment");
  const messagesContainerRef = useRef(null);
  const [userDetails, setUserDetails] = useState(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [firstMessageComplete, setFirstMessageComplete] = useState(false);
 

  const BASE_URL = "http://localhost:5000/api/v0";

  useEffect(() => {
    // Only set theme if it hasn't been manually set already
    if (chatTheme === false || chatTheme === undefined) {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setChatTheme(prefersDarkMode ? "dark" : "light");
    }
  }, []);

  // Function to handle SSE responses
  const handleSSEResponse = (url, options, onEvent) => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url, options);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
        } catch (error) {
          console.error("Error parsing SSE data:", error, event.data);
        }
      };
      
      eventSource.onerror = (error) => {
        eventSource.close();
        reject(error);
      };
      
      eventSource.onopen = () => {
        resolve(eventSource);
      };
    });
  };

  // Function to post and get SSE response
  const postAndHandleSSE = async (url, body, onEvent) => {
    try {
      // First make POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      // Set up a reader to handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split by SSE event format and process each
        const events = chunk.split("\n\n").filter(Boolean);
        
        for (const event of events) {
          // Extract data part from "data: {json}"
          const dataMatch = event.match(/^data: (.+)$/m);
          if (dataMatch && dataMatch[1]) {
            try {
              const data = JSON.parse(dataMatch[1]);
              onEvent(data);
            } catch (error) {
              console.error("Error parsing data:", error, dataMatch[1]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in SSE handling:", error);
      throw error;
    }
  };

  useEffect(() => {
    function displayLoadingMessage() {
      const interval = setInterval(() => {
        setSetUpMessage(getRandomLoadingMessage());
      }, 2000);

      if (threadId) {
        clearInterval(interval);
      }
      
      return () => clearInterval(interval);
    }

    displayLoadingMessage();
  }, [threadId]);

  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // setLoading(true); // Set loading to true during initialization
        await postAndHandleSSE(
          `${BASE_URL}/chat`,
          {
            action: "create-thread",
            campaign_id,
          },
          (data) => {
            if (data.type === "init") {
              setThreadId(data.threadId);
            } else if (data.type === "message") {
              setMessages([{ user: false, text: data.content }]);
              if (data.done) {
                //setLoading(false)
                setFirstMessageComplete(true); // Mark first message as complete
              }
            }
          }
        );
      } catch (error) {
        console.error("Error initializing chat:", error);
        // setLoading(false);
        setFirstMessageComplete(true); // In case of error, enable input
      }
    };

    initializeChat();
  }, [campaign_id]);

  const fetchCtaText = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/cta`,
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

  const handleSelection = () => {
    setShowBookingForm(true);
  };

  const handleFormSubmit = (formData) => {
    setUserDetails({
      name: formData.name,
      primary_email: formData.primary_email,
      campaign_id: formData.campaign_id,
      lead_source: formData.lead_source,
      company_id: formData.company_id
    });
    setShowBookingForm(false);
    setShowCalendly(true);
  };

  // const handleSendMessage = async () => {
  //   if (loading || !inputText.trim()) return;

  //   setLoading(true);
  //   const messageText = inputText.trim();
  //   setMessages((prev) => [...prev, { user: true, text: messageText }]);
  //   setInputText("");

  //   try {
  //     await postAndHandleSSE(
  //       `${BASE_URL}/chat`,
  //       {
  //         action: "start-stream",
  //         thread_id: threadId,
  //         question: messageText,
  //         campaign_id,
  //       },
  //       (data) => {
  //         console.log(data);
          
  //         switch (data.type) {
  //           case "init":
  //             setThreadId(data.threadId);
  //             break;
            
  //           case "message":
  //             setMessages((prev) => {
  //               const lastMessage = prev[prev.length - 1];
  //               if (!lastMessage.user && !data.done) {
  //                 const newMessages = [...prev];
  //                 newMessages[newMessages.length - 1].text = data.content;
  //                 return newMessages;
  //               } else {
  //                 return [...prev, { user: false, text: data.content }];
  //               }
  //             });
              
  //             if (data.done) {
  //               setLoading(false);
  //             }
  //             break;
            
  //           case "function":
  //             if (data.name === "bookMeeting") {
  //               // Mimic the logic: send a message, wait, then send another message before opening the booking form
  //               setMessages((prev) => [
  //                 ...prev,
  //                 {
  //                   user: false,
  //                   text: "I will open a modal to book the meeting, in a few.",
  //                 },
  //               ]);
  //               setTimeout(() => {
  //                 setMessages((prev) => [
  //                   ...prev,
  //                   {
  //                     user: false,
  //                     text: "Let me know when you are done.",
  //                   },
  //                 ]);
  //                 setTimeout(() => {
  //                   handleSelection();
  //                   setLoading(false);
  //                 }, 3000);
  //               }, 1500);
  //             }
  //             break;
            
  //           case "error":
  //             setMessages((prev) => [
  //               ...prev,
  //               { user: false, text: "Sorry, there was an error. Please try again." },
  //             ]);
  //             setLoading(false);
  //             break;
  //         }
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     setLoading(false);
  //     setMessages((prev) => [
  //       ...prev,
  //       { user: false, text: "Sorry, there was an error. Please try again." },
  //     ]);
  //   }
  // };

  const handleSendMessage = async () => {
    if (loading || !inputText.trim()) return;
  
    setLoading(true);
    const messageText = inputText.trim();
    setMessages((prev) => [...prev, { user: true, text: messageText }]);
    setInputText("");
   

  
    try {
      await postAndHandleSSE(
        `${BASE_URL}/chat`,
        {
          action: "start-stream",
          thread_id: threadId,
          question: messageText,
          campaign_id,
        },
        (data) => {
          console.log(data);
          
          switch (data.type) {
            case "init":
              setThreadId(data.threadId);
              break;
            
            case "message":
              // Check if we already have a response message from the AI for this exchange
              setMessages((prev) => {
                // Find the last message from the user
                const lastUserMessageIndex = [...prev].reverse().findIndex(msg => msg.user);
                const lastUserMessageRealIndex = lastUserMessageIndex >= 0 ? prev.length - 1 - lastUserMessageIndex : -1;
                
                // Check if there's already an AI response after the user's message
                const hasAIResponse = lastUserMessageRealIndex >= 0 && lastUserMessageRealIndex < prev.length - 1;
                
                if (hasAIResponse && !data.done) {
                  // Update the existing AI response
                  const newMessages = [...prev];
                  newMessages[prev.length - 1].text = data.content;
                  setLoading(false);
                  return newMessages;
                } else if (!hasAIResponse) {
                  // Add a new AI message if there isn't one yet
                  return [...prev, { user: false, text: data.content }];
                }
              
                return prev;
              });
              
              if (data.done) {
                // setLoading(false);
           
              }
              break;
            
            case "function":
              if (data.name === "bookMeeting") {
                // Mimic the logic: send a message, wait, then send another message before opening the booking form
                setMessages((prev) => [
                  ...prev,
                  {
                    user: false,
                    text: "I will open a modal to book the meeting, in a few.",
                  },
                ]);
                setTimeout(() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      user: false,
                      text: "Let me know when you are done.",
                    },
                  ]);
                  setTimeout(() => {
                    handleSelection();
                    setLoading(false);
                  }, 3000);
                }, 1500);
              }
              break;
            
            case "error":
              setMessages((prev) => [
                ...prev,
                { user: false, text: "Sorry, there was an error. Please try again." },
              ]);
              setLoading(false);
              break;
          }
        }
      );
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
    <main className={`relative w-full h-full chat-modal ${
      chatTheme === "dark" ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>

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
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
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

          {!threadId && (
            <div className="flex justify-center items-center">
              <span>{setUpMessage}</span>
            </div>
          )}

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
              placeholder={!firstMessageComplete ? "Waiting for Camie..." : "Ask Camie..."}
              disabled={loading || !firstMessageComplete}
              className={`pr-20 ${
                (loading || !firstMessageComplete) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTheme = chatTheme === "dark" ? "light" : "dark";
                  setChatTheme(newTheme);
                }}
                className="hover:bg-accent"
              >
                {chatTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || loading || !firstMessageComplete}
                className={`hover:bg-primary/10 ${
                  (loading || !firstMessageComplete) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        )}
        <button
          onClick={handleSelection}
          className="w-full bg-primary text-white py-2 px-4 mt-6 rounded-md hover:bg-primary/90 transition-colors"
        >
          {ctaText}
        </button>
      </div>
      </div>
      <BookingForm
        open={showBookingForm}
        onOpenChange={setShowBookingForm}
        onSubmit={handleFormSubmit}
        chatTheme={chatTheme}  // Pass the theme
        setChatTheme={setChatTheme}  // Optional: pass setter if you want to allow theme changes in the form
      />

      {showCalendly && (
        <Modal
        isOpen={showCalendly}
        setOpen={setShowCalendly}
        className={`absolute w-full h-full ${
          chatTheme === "dark" ? "dark-theme" : "light-theme"
        }`}
        link={`https://tidycal.com/camie/camieai?email=${encodeURIComponent(userDetails?.primary_email || '')}&name=${encodeURIComponent(userDetails?.name || '')}`}
        chatTheme={chatTheme}
      />
      )}
    </main>
  );
}


//working welll
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Send, Moon, Sun } from "lucide-react";
// import Modal from "@/components/app/MeetingModal";
// import ReactMarkdown from "react-markdown";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// // Booking Form Component
// function BookingForm({ open, onOpenChange, onSubmit }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" 
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://localhost:3000/api/data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });
//       const data = await response.json();
//       if (data.status) {
//         onSubmit(formData);
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Book Your Appointment</DialogTitle>
//           <DialogDescription>
//             Enter your details to book an appointment with Camie Pixel.
//           </DialogDescription>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium mb-1">
//               Name
//             </label>
//             <Input
//               id="name"
//               value={formData.name}
//               onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//               required
//             />
//           </div>
          
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium mb-1">
//               Email
//             </label>
//             <Input
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//               required
//             />
//           </div>
          
//           <Button type="submit" className="w-full">
//             Book Now
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export function ChatInterface({ campaign_id, chatTheme, setChatTheme }) {
//   const [isModalDark, setIsModalDark] = useState(false);  
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [showCalendly, setShowCalendly] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const [bookMeeting, setBookMeeting] = useState(false);
//   const messagesEndRef = useRef(null);
//   const [setUpMessage, setSetUpMessage] = useState(
//     "Loading chat environment..."
//   );
//   const [ctaText, setCtaText] = useState("Book Appointment");
//   const messagesContainerRef = useRef(null);
//   const [userDetails, setUserDetails] = useState(null);
//   const { resolvedTheme, setTheme } = useTheme();

//   const BASE_URL = "http://localhost:5000/api/v0";

//   // Function to handle SSE responses
//   const handleSSEResponse = (url, options, onEvent) => {
//     return new Promise((resolve, reject) => {
//       const eventSource = new EventSource(url, options);
      
//       eventSource.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           onEvent(data);
//         } catch (error) {
//           console.error("Error parsing SSE data:", error, event.data);
//         }
//       };
      
//       eventSource.onerror = (error) => {
//         eventSource.close();
//         reject(error);
//       };
      
//       eventSource.onopen = () => {
//         resolve(eventSource);
//       };
//     });
//   };

//   // Function to post and get SSE response
//   const postAndHandleSSE = async (url, body, onEvent) => {
//     try {
//       // First make POST request
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });
      
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
      
//       // Set up a reader to handle the streaming response
//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
      
//       // Process the stream
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
        
//         // Decode the chunk
//         const chunk = decoder.decode(value, { stream: true });
        
//         // Split by SSE event format and process each
//         const events = chunk.split("\n\n").filter(Boolean);
        
//         for (const event of events) {
//           // Extract data part from "data: {json}"
//           const dataMatch = event.match(/^data: (.+)$/m);
//           if (dataMatch && dataMatch[1]) {
//             try {
//               const data = JSON.parse(dataMatch[1]);
//               onEvent(data);
//             } catch (error) {
//               console.error("Error parsing data:", error, dataMatch[1]);
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error in SSE handling:", error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     function displayLoadingMessage() {
//       const interval = setInterval(() => {
//         setSetUpMessage(getRandomLoadingMessage());
//       }, 2000);

//       if (threadId) {
//         clearInterval(interval);
//       }
      
//       return () => clearInterval(interval);
//     }

//     displayLoadingMessage();
//   }, [threadId]);

//   useEffect(() => {
//     const initializeChat = async () => {
//       try {
//         await postAndHandleSSE(
//           `${BASE_URL}/chat`,
//           {
//             action: "create-thread",
//             campaign_id,
//           },
//           (data) => {
//             if (data.type === "init") {
//               setThreadId(data.threadId);
//             } else if (data.type === "message") {
//               setMessages([{ user: false, text: data.content }]);
//               if (data.done) {
//                 setLoading(false);
//               }
//             }
//           }
//         );
//       } catch (error) {
//         console.error("Error initializing chat:", error);
//       }
//     };

//     initializeChat();
//   }, [campaign_id]);

//   const fetchCtaText = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/cta`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ campaign_id }),
//         }
//       );
//       const data = await response.json();
//       setCtaText(data.data.call_to_action || "Book Appointment");
//     } catch (error) {
//       console.error("Failed to fetch CTA text:", error);
//     }
//   };

//   useEffect(() => {
//     fetchCtaText();
//   }, [campaign_id]);

//   const handleSelection = () => {
//     setShowBookingForm(true);
//   };

//   const handleFormSubmit = (formData) => {
//     setUserDetails({
//       name: formData.name,
//       email: formData.email,
//       campaign_id: formData.campaign_id
//     });
//     setShowBookingForm(false);
//     setShowCalendly(true);
//   };

//   const handleSendMessage = async () => {
//     if (loading || !inputText.trim()) return;

//     setLoading(true);
//     const messageText = inputText.trim();
//     setMessages((prev) => [...prev, { user: true, text: messageText }]);
//     setInputText("");

//     try {
//       await postAndHandleSSE(
//         `${BASE_URL}/chat`,
//         {
//           action: "start-stream",
//           thread_id: threadId,
//           question: messageText,
//           campaign_id,
//         },
//         (data) => {
//           console.log(data);
          
//           switch (data.type) {
//             case "init":
//               setThreadId(data.threadId);
//               break;
            
//             case "message":
//               // Update or add message based on current state
//               setMessages((prev) => {
//                 const lastMessage = prev[prev.length - 1];
//                 // If last message is from AI and we're not done with stream, update it
//                 if (!lastMessage.user && !data.done) {
//                   const newMessages = [...prev];
//                   newMessages[newMessages.length - 1].text = data.content;
//                   return newMessages;
//                 } else {
//                   // Otherwise add a new message
//                   return [...prev, { user: false, text: data.content }];
//                 }
//               });
              
//               if (data.done) {
//                 setLoading(false);
//               }
//               break;
            
//             case "function":
//               if (data.name === "bookMeeting") {
//                 setMessages((prev) => [
//                   ...prev,
//                   {
//                     user: false,
//                     text: "I'll help you open a modal to book a meeting right away.",
//                   },
//                 ]);
//                 setTimeout(() => setBookMeeting(true), 1000);
//                 setLoading(false);
//               }
//               break;
            
//             case "error":
//               setMessages((prev) => [
//                 ...prev,
//                 { user: false, text: "Sorry, there was an error. Please try again." },
//               ]);
//               setLoading(false);
//               break;
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setLoading(false);
//       setMessages((prev) => [
//         ...prev,
//         { user: false, text: "Sorry, there was an error. Please try again." },
//       ]);
//     }
//   };

//   useEffect(() => {
//     if (messagesEndRef.current && messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop =
//         messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, loading]);

//   function getRandomLoadingMessage() {
//     const loadingMessages = [
//       "Getting the chat room ready...",
//       "Warming up the servers...",
//       "Preparing your chat experience...",
//       "Setting up secure connections...",
//       "Almost there! Just a few more seconds...",
//       "Loading chat environment...",
//       "Connecting to chat servers...",
//       "Initializing chat features...",
//       "Making sure everything is perfect...",
//       "Polishing the chat interface...",
//       "Double-checking security protocols...",
//       "Optimizing your chat experience...",
//       "Loading final components...",
//       "Setting up encryption...",
//       "Configuring chat settings...",
//     ];
//     return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
//   }

//   return (
//     <main className={`relative w-full h-full chat-modal ${
//       chatTheme === "dark" ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>

//       <div className="flex flex-col w-full h-full">
//         {!hideHeader && (
//           <div className="p-4 text-center border-b">
//             <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
//             <p className="text-sm text-muted-foreground">
//               How can I help you today?
//             </p>
//           </div>
//         )}

//         <div
//           ref={messagesContainerRef}
//           className="flex-1 overflow-y-auto p-4 pl-0 space-y-4"
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
//                     src="https://camie-ace.github.io/camie-animated-box/love.gif"
//                     alt="AI"
//                     className="w-8 h-8 rounded-full shrink-0"
//                   />
//                 )}
//                 <div
//                   className={`
//                     max-w-full p-3 rounded-lg break-words
//                     ${
//                       message.user
//                         ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
//                       : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
//                     }
//                   `}
//                 >
//                   <ReactMarkdown
//                     components={{
//                       p: ({ node, ...props }) => (
//                         <p className="mb-2" {...props} />
//                       ),
//                       ul: ({ node, ...props }) => (
//                         <ul className="list-disc ml-4 mb-2" {...props} />
//                       ),
//                       ol: ({ node, ...props }) => (
//                         <ol className="list-decimal ml-4 mb-2" {...props} />
//                       ),
//                       li: ({ node, ...props }) => (
//                         <li className="mb-1" {...props} />
//                       ),
//                       h1: ({ node, ...props }) => (
//                         <h1 className="text-xl font-bold mb-2" {...props} />
//                       ),
//                       h2: ({ node, ...props }) => (
//                         <h2 className="text-lg font-bold mb-2" {...props} />
//                       ),
//                       h3: ({ node, ...props }) => (
//                         <h3 className="text-md font-bold mb-2" {...props} />
//                       ),
//                       a: ({ node, ...props }) => (
//                         <a className="text-md mb-2 underline" {...props} />
//                       ),
//                       code: ({ node, inline, ...props }) =>
//                         inline ? (
//                           <code
//                             className="bg-gray-200 dark:bg-gray-600 px-1 rounded"
//                             {...props}
//                           />
//                         ) : (
//                           <pre className="bg-gray-200 dark:bg-gray-600 p-2 rounded mb-2 overflow-x-auto">
//                             <code {...props} />
//                           </pre>
//                         ),
//                     }}
//                   >
//                     {message.text}
//                   </ReactMarkdown>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {!threadId && (
//             <div className="flex justify-center items-center">
//               <span>{setUpMessage}</span>
//             </div>
//           )}

//           {loading && (
//             <div className="flex justify-start items-center gap-3">
//               <img
//                 src="https://camie-ace.github.io/camie-animated-box/love.gif"
//                 alt="AI"
//                 className="w-8 h-8 rounded-full"
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

//         <div className="p-4 border-t">
//           {threadId && (
//             <div className="relative">
//               <Input
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (loading && e.key === "Enter") {
//                     e.preventDefault();
//                     return;
//                   }
//                   if (e.key === "Enter") handleSendMessage();
//                 }}
//                 placeholder="Ask Camie..."
//                 disabled={loading}
//                 className={`pr-20 ${
//                   loading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               />
//               <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     const newTheme = chatTheme === "dark" ? "light" : "dark";
//                     setChatTheme(newTheme);
//                   }}
//                   className="hover:bg-accent"
//                 >
//                   {chatTheme === "dark" ? (
//                     <Sun className="h-5 w-5" />
//                   ) : (
//                     <Moon className="h-5 w-5" />
//                   )}
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleSendMessage}
//                   disabled={!inputText.trim() || loading}
//                   className={`hover:bg-primary/10 ${
//                     loading ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//                 >
//                   <Send className="h-5 w-5 text-primary" />
//                 </Button>
//               </div>
//             </div>
//           )}
//           <button
//             onClick={handleSelection}
//             className="w-full bg-primary text-white py-2 px-4 mt-6 rounded-md hover:bg-primary/90 transition-colors"
//           >
//             {ctaText}
//           </button>
//         </div>
//       </div>
//       <BookingForm
//         open={showBookingForm}
//         onOpenChange={setShowBookingForm}
//         onSubmit={handleFormSubmit}
//       />

//       {showCalendly && (
//         <Modal
//           isOpen={showCalendly}
//           setOpen={setShowCalendly}
//           className="absolute w-full h-full"
//           link={`https://tidycal.com/camie/camieai?email=${encodeURIComponent(userDetails?.email || '')}&name=${encodeURIComponent(userDetails?.name || '')}`}
//         />
//       )}
//     </main>
//   );
// }




// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Send, Moon, Sun } from "lucide-react";
// import Modal from "@/components/app/MeetingModal";
// import ReactMarkdown from "react-markdown";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// // Booking Form Component
// function BookingForm({ open, onOpenChange, onSubmit }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" 
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:3000/api/data", formData);
//       if (response.data.status) {
//         onSubmit(formData);
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Book Your Appointment</DialogTitle>
//           <DialogDescription>
//             Enter your details to book an appointment with Camie Pixel.
//           </DialogDescription>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium mb-1">
//               Name
//             </label>
//             <Input
//               id="name"
//               value={formData.name}
//               onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//               required
//             />
//           </div>
          
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium mb-1">
//               Email
//             </label>
//             <Input
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//               required
//             />
//           </div>
          
//           <Button type="submit" className="w-full">
//             Book Now
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }




// export function ChatInterface({ campaign_id, chatTheme,
//   setChatTheme, }) {

    
//   const [isModalDark, setIsModalDark] = useState(false);  
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [showCalendly, setShowCalendly] = useState(false);
//   const [threadId, setThreadId] = useState(null);
//   const [bookMeeting, setBookMeeting] = useState(false);
//   const messagesEndRef = useRef(null);
//   const [setUpMessage, setSetUpMessage] = useState(
//     "Loading chat environment..."
//   );
//   const [ctaText, setCtaText] = useState("Book Appointment");
//   const messagesContainerRef = useRef(null);
//   const [userDetails, setUserDetails] = useState(null);
//   const { resolvedTheme, setTheme } = useTheme();

//   const BASE_URL = "http://localhost:5000/api/v0"

//   const callAiChatEndpoint = async (body) => {
//     const response = await fetch(`${BASE_URL}/chat`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });
//     return response;
//   };

//   useEffect(() => {
//     function displayLoadingMessage() {
//       const interval = setInterval(() => {
//         setSetUpMessage(getRandomLoadingMessage());
//       }, 2000);

//       if (threadId) {
//         clearInterval(interval);
//       }
//     }

//     displayLoadingMessage();
//   }, [threadId]);

//   useEffect(() => {
//     const initializeChat = async () => {
//       try {
//         const response = await callAiChatEndpoint({
//           action: "create-thread",
//           campaign_id,
//         });

//         const reader = response.body.getReader();

//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = new TextDecoder().decode(value);
//           const messages = chunk.split("\n").filter(Boolean);

//           for (const message of messages) {
//             const data = JSON.parse(message);

//             if (data.type === "init") {
//               // Set the thread ID when we receive the init message
//               setThreadId(data.threadId);
//             } else if (data.type === "message") {
//               setMessages([{ user: false, text: data.content }]);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error initializing chat:", error);
//       }
//     };

//     initializeChat();
//   }, [campaign_id]);

//   const fetchCtaText = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/cta`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ campaign_id }),
//         }
//       );
//       const data = await response.json();
//       setCtaText(data.data.call_to_action || "Book Appointment");
//     } catch (error) {
//       console.error("Failed to fetch CTA text:", error);
//     }
//   };

//   useEffect(() => {
//     fetchCtaText();
//   }, [campaign_id]);

//   const handleStreamResponse = async (response) => {
//     const reader = response.body.getReader();
//     let currentMessage = "";

//     try {
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         // Convert the chunk to text
//         const chunk = new TextDecoder().decode(value);
//         const lines = chunk.split("\n").filter(Boolean);

//         for (const line of lines) {
//           try {
//             const data = JSON.parse(line);

//             console.log(data);

//             switch (data.type) {
//               case "init":
//                 setThreadId(data.threadId);
//                 break;

//               case "message":
//                 if (!currentMessage) {
//                   // Add new message if this is the first chunk
//                   setMessages((prev) => [
//                     ...prev,
//                     { user: false, text: data.content },
//                   ]);
//                 } else {
//                   // Update existing message
//                   setMessages((prev) => {
//                     const newMessages = [...prev];
//                     newMessages[newMessages.length - 1].text = data.content;
//                     return newMessages;
//                   });
//                 }
//                 currentMessage = data.content;

//                 if (data.content) {
//                   setLoading(false);
//                 }
//                 break;

//               case "function":
//                 if (data.name === "bookMeeting") {
//                   console.log(messages[messages.length]);
//                   console.log(messages.length);
//                   if (
//                     messages[messages.length] !=
//                     "I'll help you open a modal to book a meeting right away."
//                   ) {
//                     setMessages((prev) => [
//                       ...prev,
//                       {
//                         user: false,
//                         text: "I'll help you open a modal to book a meeting right away.",
//                       },
//                     ]);
//                   }
//                   setTimeout(() => setBookMeeting(true), 1000);
//                   setLoading(false);
//                 }
//                 break;
//             }
//           } catch (error) {
//             console.error("Error parsing message:", error);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Stream reading error:", error);
//       setLoading(false);
//       setMessages((prev) => [
//         ...prev,
//         { user: false, text: "Sorry, there was an error. Please try again." },
//       ]);
//     }
//   };

//   const handleSelection = () => {
//     setShowBookingForm(true);
//   };

//   const handleFormSubmit = (formData) => {
//     // Now formData includes name, email, and campaign_id
//     setUserDetails({
//       name: formData.name,
//       email: formData.email,
//       campaign_id: formData.campaign_id
//     });
//     setShowBookingForm(false);
//     setShowCalendly(true);
//   };

//   const handleSendMessage = async () => {
//     if (loading || !inputText.trim()) return;

//     setLoading(true);
//     const messageText = inputText.trim();
//     setMessages((prev) => [...prev, { user: true, text: messageText }]);
//     setInputText("");

//     try {
//       const response = await callAiChatEndpoint({
//         action: "start-stream",
//         thread_id: threadId,
//         question: messageText,
//         campaign_id,
//       });

//       if (!response.ok) throw new Error("Network response was not ok");
//       await handleStreamResponse(response);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setLoading(false);
//       setMessages((prev) => [
//         ...prev,
//         { user: false, text: "Sorry, there was an error. Please try again." },
//       ]);
//     }
//   };

//   useEffect(() => {
//     if (messagesEndRef.current && messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop =
//         messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, loading]);

//   function getRandomLoadingMessage() {
//     const loadingMessages = [
//       "Getting the chat room ready...",
//       "Warming up the servers...",
//       "Preparing your chat experience...",
//       "Setting up secure connections...",
//       "Almost there! Just a few more seconds...",
//       "Loading chat environment...",
//       "Connecting to chat servers...",
//       "Initializing chat features...",
//       "Making sure everything is perfect...",
//       "Polishing the chat interface...",
//       "Double-checking security protocols...",
//       "Optimizing your chat experience...",
//       "Loading final components...",
//       "Setting up encryption...",
//       "Configuring chat settings...",
//     ];
//     return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
//   }

//   return (
//     <main  className={`relative w-full h-full chat-modal ${
//       chatTheme === "dark"  ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>

//       <div className="flex flex-col w-full h-full">
//         {!hideHeader && (
//           <div className="p-4 text-center border-b">
//             <h2 className="text-xl font-bold text-primary/70">Hello, there</h2>
//             <p className="text-sm text-muted-foreground">
//               How can I help you today?
//             </p>
//           </div>
//         )}

//         <div
//           ref={messagesContainerRef}
//           className="flex-1 overflow-y-auto p-4 pl-0 space-y-4"
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
//                     src="https://camie-ace.github.io/camie-animated-box/love.gif"
//                     alt="AI"
//                     className="w-8 h-8 rounded-full shrink-0"
//                   />
//                 )}
//                 <div
//                   className={`
//                     max-w-full p-3 rounded-lg break-words
//                     ${
//                       message.user
//                         ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
//                   : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}
                  
//                   `}
//                 >
//                   <ReactMarkdown
//                     components={{
//                       p: ({ node, ...props }) => (
//                         <p className="mb-2" {...props} />
//                       ),
//                       ul: ({ node, ...props }) => (
//                         <ul className="list-disc ml-4 mb-2" {...props} />
//                       ),
//                       ol: ({ node, ...props }) => (
//                         <ol className="list-decimal ml-4 mb-2" {...props} />
//                       ),
//                       li: ({ node, ...props }) => (
//                         <li className="mb-1" {...props} />
//                       ),
//                       h1: ({ node, ...props }) => (
//                         <h1 className="text-xl font-bold mb-2" {...props} />
//                       ),
//                       h2: ({ node, ...props }) => (
//                         <h2 className="text-lg font-bold mb-2" {...props} />
//                       ),
//                       h3: ({ node, ...props }) => (
//                         <h3 className="text-md font-bold mb-2" {...props} />
//                       ),
//                       a: ({ node, ...props }) => (
//                         <a className="text-md mb-2 underline" {...props} />
//                       ),
//                       code: ({ node, inline, ...props }) =>
//                         inline ? (
//                           <code
//                             className="bg-gray-200 dark:bg-gray-600 px-1 rounded"
//                             {...props}
//                           />
//                         ) : (
//                           <pre className="bg-gray-200 dark:bg-gray-600 p-2 rounded mb-2 overflow-x-auto">
//                             <code {...props} />
//                           </pre>
//                         ),
//                     }}
//                   >
//                     {message.text}
//                   </ReactMarkdown>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {!threadId && (
//             <div className="flex justify-center items-center">
//               <span>{setUpMessage}</span>
//             </div>
//           )}

//           {loading && (
//             <div className="flex justify-start items-center gap-3">
//               <img
//                 src="https://camie-ace.github.io/camie-animated-box/love.gif"
//                 alt="AI"
//                 className="w-8 h-8 rounded-full"
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

//         <div className="p-4 border-t">
//           {threadId && (
//             <div className="relative">
//               <Input
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (loading && e.key === "Enter") {
//                     e.preventDefault();
//                     return;
//                   }
//                   if (e.key === "Enter") handleSendMessage();
//                 }}
//                 placeholder="Ask Camie..."
//                 disabled={loading}
//                 className={`pr-20 ${
//                   loading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               />
//               <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
//                  <Button
//                  variant="ghost"
//                  size="icon"
//                  onClick={() => {
//                    const newTheme = chatTheme === "dark" ? "light" : "dark";
//                    setChatTheme(newTheme);
//                  }}
//                  className="hover:bg-accent"
//                >
//                  {chatTheme === "dark" ? (
//                    <Sun className="h-5 w-5" />
//                  ) : (
//                    <Moon className="h-5 w-5" />
//                  )}
//                </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleSendMessage}
//                   disabled={!inputText.trim() || loading}
//                   className={`hover:bg-primary/10 ${
//                     loading ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//                 >
//                   <Send className="h-5 w-5 text-primary" />
//                 </Button>
//               </div>
//             </div>
//           )}
//           <button
//             onClick={handleSelection}
//             className="w-full bg-primary text-white py-2 px-4 mt-6 rounded-md hover:bg-primary/90 transition-colors"
//           >
//             {ctaText}
//           </button>
//         </div>
//       </div>
//       <BookingForm
//         open={showBookingForm}
//         onOpenChange={setShowBookingForm}
//         onSubmit={handleFormSubmit}
//       />

//       {showCalendly && (
//         <Modal
//           isOpen={showCalendly}
//           setOpen={setShowCalendly}
//           className="absolute w-full h-full"
//           link={`https://tidycal.com/camie/camieai?email=${encodeURIComponent(userDetails.email)}&name=${encodeURIComponent(userDetails.name)}`}
        
//         />
//       )}
//     </main>
//   );
// }
