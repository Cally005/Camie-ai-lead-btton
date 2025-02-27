// "use client";
// import React, { useEffect, useState } from "react";
// import { useTheme } from "next-themes";
// import { Card } from "@/components/ui/card";
// import Vapi from "@vapi-ai/web";
// import { Button } from "@/components/ui/button";
// import { Mic, MicOff, Moon, Sun } from "lucide-react";
// import Modal from "./MeetingModal";
// import axios from "axios";
// import { Input } from "@/components/ui/input";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";


// interface FormData {
//   first_name: string;
//   email: string;
//   campaign_id: string;
// }

// interface BookingFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (data: FormData) => void;
// }

// interface UserDetails {
//   first_name: string;
//   email: string;
//   campaign_id: string;
// }

// // Booking Form Component
// function BookingForm({ open, onOpenChange, onSubmit }: BookingFormProps) {
//   const [formData, setFormData] = useState<FormData>({
//     first_name: '',
//     email: '',
//     campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" 
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://localhost:5000/api/v0/test-leads", {
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
//               value={formData.first_name}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
//                 setFormData(prev => ({ ...prev, first_name: e.target.value }))}
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
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
//                 setFormData(prev => ({ ...prev, email: e.target.value }))}
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

// // export default BookingForm;

// export function VoiceInterface({ campaign_id,   voiceTheme,
//   setVoiceTheme,
//   handleMOdalClose }:
//    { campaign_id: string 
//     voiceTheme: string;
//   setVoiceTheme: (theme?: string) => void;
//   handleMOdalClose: (state?: boolean) => void;
//    }) {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [micPermission, setMicPermission] = useState<boolean | null>(null);
//   const { resolvedTheme, setTheme } = useTheme();
//   const [connecting, setConnecting] = useState(false);
//   const [assistantOptions, setAssistantOptions] = useState(null);
//   const [assistantId, setAssistantId] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [ctaText, setCtaText] = useState("Book Appointment");
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [showCalendly, setShowCalendly] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
//   const [bookMeeting, setBookMeeting] = useState(false);
//   const [meetingResponse, setMeetingResponse] = useState(null);
//   const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
//   const [setUpMessage, setSetUpMessage] = useState(
//     "Setting up audio channels..."
//   );
//   const [link, setLink] = useState(null);
//   const BASE_URL = "http://localhost:5000/api/v0";



//   // Create a ref to store the Vapi instance
//   const vapiRef = React.useRef(
//     new Vapi("9c71146b-9068-42b4-8ea5-45e530152dc5")
//   );
//   const vapi = vapiRef.current;
//   // Enhanced event listeners
//   useEffect(() => {
//     const vapi = vapiRef.current;

//     vapi.on("call-start", () => {
//       setConnecting(false);
//       setConnected(true);
//       console.log("Call has started.");
//     });

//     vapi.on("call-end", () => {
//       setConnecting(false);
//       setConnected(false);
//       setIsSpeaking(false);
//       console.log("Call has ended.");
//     });

//     vapi.on("speech-start", () => {
//       setAssistantIsSpeaking(true);
//     });

//     vapi.on("speech-end", () => {
//       setAssistantIsSpeaking(false);
//     });

//     vapi.on("message", (message) => {
//       console.log(message);
//       if (
//         message.type === "function-call" &&
//         message.functionCall.name === "bookAppointmentModal"
//       ) {
//         setBookMeeting(true);
//       }
//     });

//     // Cleanup on unmount
//     return () => {
//       vapi.stop();
//     };
//   }, []);

//   // Fetch CTA text once
//   useEffect(() => {
//     const fetchCtaText = async () => {
//       try {
//         const response = await axios.post(
//           `${BASE_URL}/cta`,
//           { campaign_id },
//           { headers: { "Content-Type": "application/json" } }
//         );
//         setCtaText(response.data.data.call_to_action || "Book Appointment");
//       } catch (error) {
//         console.error("Failed to fetch CTA text:", error);
//         setCtaText("Book Appointment");
//       }
//     };

//     fetchCtaText();
//   }, []);

//   useEffect(() => {
//     if (assistantId && assistantOptions) {
//       console.log(assistantId);
//       console.log(assistantOptions);
//       startCallInline();
//     }
//   }, [assistantId, assistantOptions]);
//   //fetch assiatant config
//   useEffect(() => {
//     const assistantConfig = async () => {
//       try {
//         const response = await axios.post(
//           `${BASE_URL}/voice`,
//           {
//             campaign_id,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log(response);
//         setAssistantOptions(response.data.data.assistant);
//         setAssistantId(response.data.data.assistantId);
//         setLink(response.data.data.meeting_link);
//       } catch (error) {
//         console.error("Error fetching assistant:", error);
//       }
//     };

//     assistantConfig();
//   }, []);

//   const handleSelection = () => {
//     setShowBookingForm(true);
//   };

//   // Fixed end call handler
//   const endCall = async () => {
//     try {
//       setIsSpeaking(false);
//       setConnecting(false);
//       setConnected(false);
//       // Use the ref to access the Vapi instance
//       vapiRef.current.stop();
//       console.log("Call ended successfully");
//     } catch (error) {
//       console.error("Error ending call:", error);
//     }
//   };

//   // Enhanced call start handler
//   const startCallInline = async () => {
//     if (assistantOptions && assistantId) {
//       try {
//         await navigator.mediaDevices.getUserMedia({ audio: true });
//         setConnecting(true);
//         setIsSpeaking(true);
//         setMicPermission(true);

//         // Use the ref to access the Vapi instance
//         await vapiRef.current.start(assistantId, assistantOptions as object);
//       } catch (error) {
//         console.error("Microphone access denied:", error);
//         setMicPermission(false);
//         setIsSpeaking(false);
//         setConnecting(false);
//         alert(
//           "Microphone access is required to start the call. Please grant permission."
//         );
//       }
//     } else {
//       console.log(assistantOptions);
//       alert(" Sorry Can't start call.");
//     }
//   };

//   const handleFormSubmit = (formData: FormData): void => {
//     setUserDetails({
//       first_name: formData.first_name,
//       email: formData.email,
//       campaign_id: formData.campaign_id
//     });
//     setShowBookingForm(false);
//     setShowCalendly(true);
//   };

//   // Meeting response handler
//   useEffect(() => {
//     if (meetingResponse) {
//       console.log(meetingResponse);
//       vapi.send({
//         type: "add-message",
//         message: {
//           role: "system",
//           content: meetingResponse,
//         },
//       });
//     }
//   }, [meetingResponse, vapiRef]);

//   function getRandomVoiceLoadingMessage() {
//     const voiceLoadingMessages = [
//       "Activating voice interface...",
//       "Warming up the microphone...",
//       "Calibrating voice recognition...",
//       "Setting up audio channels...",
//       "Preparing voice assistant...",
//       "Initializing speech processing...",
//       "Optimizing voice quality...",
//       "Configuring audio settings...",
//       "Testing voice clarity...",
//       "Establishing voice connection...",
//       "Tuning speech recognition...",
//       "Getting your voice assistant ready...",
//       "Setting up secure voice channel...",
//       "Preparing for conversation...",
//       "Initializing voice features...",
//     ];

//     // Get a random index
//     const randomIndex = Math.floor(Math.random() * voiceLoadingMessages.length);

//     // Return the random message
//     return voiceLoadingMessages[randomIndex];
//   }

//   useEffect(() => {
//     function displayLoadingMessage() {
//       // Update message every 2 seconds
//       const interval = setInterval(() => {
//         setSetUpMessage(getRandomVoiceLoadingMessage());
//       }, 2000);

//       if (assistantOptions) {
//         clearInterval(interval);
//       }
//     }

//     displayLoadingMessage();
//   }, [assistantOptions]);

//   // Render sound waves animation
//   const SoundWaves = () => (
//     <div className="absolute inset-0 flex justify-center items-center z-0 overflow-hidden">
//       {[1, 2, 3].map((wave) => (
//         <div
//           key={wave}
//           className={`absolute h-[12px] w-36 
//             ${resolvedTheme === "dark" ? "bg-primary/30 " : "bg-primary/50 "}
//             rounded-full animate-pulse 
//             ${
//               wave === 1
//                 ? "left-[calc(50%-10rem)]"
//                 : wave === 2
//                 ? "left-[calc(50%-5rem)]"
//                 : "left-[calc(50%+5rem)]"
//             }
//             ${
//               wave === 1 ? "delay-100" : wave === 2 ? "delay-300" : "delay-500"
//             }`}
//         ></div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="flex justify-center items-center mt-20 relative">
//       {assistantOptions ? (
//         <div className="flex flex-col justify-center items-center mt-auto relative w-full max-w-md">
//           <Card
//             className={`
//               flex justify-center items-center w-[180px] h-[180px] mx-auto rounded-full 
//               shadow-2xl transition-all duration-300 ease-in-out relative mb-8
//               ${
//                 isSpeaking
//                   ? "bg-destructive/10 border-4 border-destructive/50 scale-105"
//                   : "bg-primary/10 hover:bg-primary/20"
//               }
//               cursor-pointer overflow-hidden
//             `}
//             onClick={connected ? endCall : startCallInline}
//           >
//             {connected ? (
//               <MicOff
//                 className="w-[80px] h-[80px] text-destructive cursor-pointer"
//                 strokeWidth={1.5}
//               />
//             ) : (
//               <Mic
//                 className="w-[80px] h-[80px] text-primary cursor-pointer"
//                 strokeWidth={1.5}
//               />
//             )}
//           </Card>

//           {/* Controls container with improved spacing */}
//           <div className="flex flex-col items-center space-y-6">
//             <p
//               className={`transition-all duration-300 ${
//                 isSpeaking
//                   ? "text-destructive font-semibold"
//                   : "text-muted-foreground"
//               }`}
//             >
//               {connecting || connected
//                 ? connected
//                   ? assistantIsSpeaking
//                     ? "Voice assistant is speaking"
//                     : "Conversation in Progress"
//                   : "Please wait connecting voice assistant"
//                 : "Start Conversation"}
//             </p>

//             {/* CTA Button */}
//             <button
//               onClick={handleSelection}
//               className="w-full min-w-[200px] bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//             >
//               {ctaText}
//             </button>

//             {/* Theme toggle button */}
//             <Button
//             variant="outline"
//             size="icon"
//             onClick={() => {
//               const newTheme = voiceTheme === "dark" ? "light" : "dark";
//               setVoiceTheme(newTheme);
//               // The parent dialog will automatically update due to the class changes
//             }}
//             className="hover:bg-accent"
//           >
//             {voiceTheme === "dark" ? (
//               <Sun className="h-5 w-5" />
//             ) : (
//               <Moon className="h-5 w-5" />
//             )}
//           </Button>
//           </div>
//         </div>
//       ) : (
//         setUpMessage
//       )}

//       {/* Modal remains the same */}
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
//           link={`https://tidycal.com/camie/camieai?email=${encodeURIComponent(userDetails?.email || '')}&name=${encodeURIComponent(userDetails?.first_name || '')}`}
//         />
//       )}
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Moon, Sun } from "lucide-react";
import Modal from "./MeetingModal";
import axios from "axios";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FormData {
  first_name: string;
  email: string;
  campaign_id: string;
}

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
}

interface UserDetails {
  first_name: string;
  email: string;
  campaign_id: string;
}

// Booking Form Component
function BookingForm({ open, onOpenChange, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    email: '',
    campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/v0/test-leads", {
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
      <DialogContent className="sm:max-w-md">
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
              value={formData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, first_name: e.target.value }))}
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
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, email: e.target.value }))}
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

export function VoiceInterface({ 
  campaign_id,   
  voiceTheme,
  setVoiceTheme,
  handleMOdalClose 
}: { 
  campaign_id: string;
  voiceTheme: string;
  setVoiceTheme: (theme?: string) => void;
  handleMOdalClose: (state?: boolean) => void;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [connecting, setConnecting] = useState(false);
  const [assistantOptions, setAssistantOptions] = useState<any>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [ctaText, setCtaText] = useState("Book Appointment");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [bookMeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState<any>(null);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [setUpMessage, setSetUpMessage] = useState("Setting up audio channels...");
  const [link, setLink] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = "http://localhost:5000/api/v0";

  // Create a ref to store the Vapi instance
  const vapiRef = useRef<any>(null);

  // Initialize Vapi instance only once
  useEffect(() => {
    if (!vapiRef.current) {
      try {
        vapiRef.current = new Vapi("9c71146b-9068-42b4-8ea5-45e530152dc5");
        console.log("Vapi instance created successfully");
      } catch (error) {
        console.error("Failed to create Vapi instance:", error);
        setError("Failed to initialize voice assistant");
      }
    }

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {
          console.error("Error stopping Vapi:", e);
        }
      }
      
      // Release microphone stream if it exists
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set up event listeners for Vapi
  useEffect(() => {
    if (!vapiRef.current) return;
    
    const vapi = vapiRef.current;

    // Clear any existing listeners to prevent duplicates
    vapi.removeAllListeners?.();
    
    // Setup event listeners
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setError(null);
      console.log("Call has started successfully");
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
      setIsSpeaking(false);
      console.log("Call has ended");
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("error", (err: any) => {
      console.error("Vapi error:", err);
      setError(err.message || "An error occurred with the voice assistant");
      setConnecting(false);
      setConnected(false);
      setIsSpeaking(false);
    });

    vapi.on("message", (message: any) => {
      console.log("Received message:", message);
      if (
        message.type === "function-call" &&
        message.functionCall.name === "bookAppointmentModal"
      ) {
        setShowBookingForm(true);
      }
    });
  }, [vapiRef.current]);

  // Fetch CTA text once
  useEffect(() => {
    const fetchCtaText = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/cta`,
          { campaign_id },
          { headers: { "Content-Type": "application/json" } }
        );
        setCtaText(response.data.data.call_to_action || "Book Appointment");
      } catch (error) {
        console.error("Failed to fetch CTA text:", error);
        setCtaText("Book Appointment");
      }
    };

    fetchCtaText();
  }, [campaign_id]);

  // Start the call when configuration is ready
  useEffect(() => {
    // Only auto-start if needed
    // For now, we'll leave this commented out and let the user click to start
    if (assistantId && assistantOptions && !connected && !connecting) {
      startCallInline();
     }
  }, [assistantId, assistantOptions]);

  // Fetch assistant configuration
  useEffect(() => {
    const assistantConfig = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/voice`,
          { campaign_id },
          { headers: { "Content-Type": "application/json" } }
        );
        
        console.log("Assistant config response:", response.data);
        
        if (response.data.data && response.data.data.assistant && response.data.data.assistantId) {
          setAssistantOptions(response.data.data.assistant);
          setAssistantId(response.data.data.assistantId);
          setLink(response.data.data.meeting_link);
          setError(null);
        } else {
          console.error("Invalid assistant configuration:", response.data);
          setError("Failed to load assistant configuration");
        }
      } catch (error) {
        console.error("Error fetching assistant:", error);
        setError("Failed to fetch assistant configuration");
      }
    };

    assistantConfig();
  }, [campaign_id]);

  // Handle booking form submission
  const handleSelection = () => {
    setShowBookingForm(true);
  };

  // End call handler with improved error handling
  const endCall = async () => {
    try {
      setIsSpeaking(false);
      setConnecting(false);
      
      if (vapiRef.current) {
        await vapiRef.current.stop();
        console.log("Call ended successfully");
      }
      
      // Release microphone stream if it exists
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
      
      setConnected(false);
      setError(null);
    } catch (error) {
      console.error("Error ending call:", error);
      setError("Failed to end call properly");
    }
  };

  // Start call handler with improved error handling and debugging
  const startCallInline = async () => {
    if (!assistantOptions || !assistantId) {
      setError("Assistant configuration is missing");
      console.error("Missing configuration:", { assistantOptions, assistantId });
      return;
    }
    
    if (connected || connecting) {
      console.log("Call is already in progress or connecting");
      return;
    }
    
    try {
      setConnecting(true);
      setError(null);
      
      // Request microphone access first
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      console.log("Microphone access granted:", stream);
      setMicStream(stream);
      setMicPermission(true);
      setIsSpeaking(true);
      
      // Ensure Vapi instance exists
      if (!vapiRef.current) {
        vapiRef.current = new Vapi("9c71146b-9068-42b4-8ea5-45e530152dc5");
        console.log("Created new Vapi instance");
      }
      
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Start the call with configuration
      console.log("Starting call with:", { assistantId, assistantOptions });
      await vapiRef.current.start(assistantId, assistantOptions);
      
      console.log("Call start initiated successfully");
    } catch (error: any) {
      console.error("Error starting call:", error);
      
      setConnecting(false);
      setIsSpeaking(false);
      
      if (error.name === 'NotAllowedError') {
        setMicPermission(false);
        setError("Microphone access denied. Please grant permission in your browser settings.");
      } else if (error.name === 'NotFoundError') {
        setMicPermission(false);
        setError("No microphone found. Please check your device.");
      } else {
        setError(`Failed to start call: ${error.message || "Unknown error"}`);
      }
      
      // Release any stream that might have been obtained
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
    }
  };

  const handleFormSubmit = (formData: FormData): void => {
    setUserDetails({
      first_name: formData.first_name,
      email: formData.email,
      campaign_id: formData.campaign_id
    });
    setShowBookingForm(false);
    setShowCalendly(true);
  };

  // Meeting response handler
  useEffect(() => {
    if (meetingResponse && vapiRef.current && connected) {
      console.log("Sending meeting response to assistant:", meetingResponse);
      try {
        vapiRef.current.send({
          type: "add-message",
          message: {
            role: "system",
            content: meetingResponse,
          },
        });
      } catch (error) {
        console.error("Error sending meeting response:", error);
      }
    }
  }, [meetingResponse, connected]);

  // Loading message generator
  function getRandomVoiceLoadingMessage() {
    const voiceLoadingMessages = [
      "Activating voice interface...",
      "Warming up the microphone...",
      "Calibrating voice recognition...",
      "Setting up audio channels...",
      "Preparing voice assistant...",
      "Initializing speech processing...",
      "Optimizing voice quality...",
      "Configuring audio settings...",
      "Testing voice clarity...",
      "Establishing voice connection...",
      "Tuning speech recognition...",
      "Getting your voice assistant ready...",
      "Setting up secure voice channel...",
      "Preparing for conversation...",
      "Initializing voice features...",
    ];

    return voiceLoadingMessages[Math.floor(Math.random() * voiceLoadingMessages.length)];
  }

  // Update loading message regularly
  useEffect(() => {
    if (!assistantOptions) {
      const interval = setInterval(() => {
        setSetUpMessage(getRandomVoiceLoadingMessage());
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [assistantOptions]);

  // Sound waves animation component
  const SoundWaves = () => (
    <div className="absolute inset-0 flex justify-center items-center z-0 overflow-hidden">
      {[1, 2, 3].map((wave) => (
        <div
          key={wave}
          className={`absolute h-[12px] w-36 
            ${voiceTheme === "dark" ? "bg-primary/30 " : "bg-primary/50 "}
            rounded-full animate-pulse 
            ${
              wave === 1
                ? "left-[calc(50%-10rem)]"
                : wave === 2
                ? "left-[calc(50%-5rem)]"
                : "left-[calc(50%+5rem)]"
            }
            ${
              wave === 1 ? "delay-100" : wave === 2 ? "delay-300" : "delay-500"
            }`}
        ></div>
      ))}
    </div>
  );

  return (
    <div className="flex justify-center items-center mt-20 relative">
      {assistantOptions ? (
        <div className="flex flex-col justify-center items-center mt-auto relative w-full max-w-md">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-4 text-center">
              {error}
            </div>
          )}
          
          <Card
            className={`
              flex justify-center items-center w-[180px] h-[180px] mx-auto rounded-full 
              shadow-2xl transition-all duration-300 ease-in-out relative mb-8
              ${
                isSpeaking
                  ? "bg-destructive/10 border-4 border-destructive/50 scale-105"
                  : "bg-primary/10 hover:bg-primary/20"
              }
              cursor-pointer overflow-hidden
            `}
            onClick={connected ? endCall : startCallInline}
          >
            {connected ? (
              <MicOff
                className="w-[80px] h-[80px] text-destructive cursor-pointer"
                strokeWidth={1.5}
              />
            ) : (
              <Mic
                className="w-[80px] h-[80px] text-primary cursor-pointer"
                strokeWidth={1.5}
              />
            )}
            
            {/* Show sound waves only when connected and speaking */}
            {connected && assistantIsSpeaking && <SoundWaves />}
          </Card>

          {/* Controls container with improved spacing */}
          <div className="flex flex-col items-center space-y-6">
            <p
              className={`transition-all duration-300 ${
                isSpeaking
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {connecting 
                ? "Connecting to voice assistant..."
                : connected
                  ? assistantIsSpeaking
                    ? "Voice assistant is speaking"
                    : "Conversation in progress"
                  : "Click the mic to start conversation"
              }
            </p>

            {/* CTA Button */}
            <button
              onClick={handleSelection}
              className="w-full min-w-[200px] bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              {ctaText}
            </button>

            {/* Theme toggle button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newTheme = voiceTheme === "dark" ? "light" : "dark";
                setVoiceTheme(newTheme);
              }}
              className="hover:bg-accent"
            >
              {voiceTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p>{setUpMessage}</p>
          {error && (
            <p className="text-destructive mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Booking form modal */}
      <BookingForm
        open={showBookingForm}
        onOpenChange={setShowBookingForm}
        onSubmit={handleFormSubmit}
      />

      {/* Calendly modal */}
      {showCalendly && userDetails && (
        <Modal
          isOpen={showCalendly}
          setOpen={setShowCalendly}
          className="absolute w-full h-full"
          link={`https://tidycal.com/camie/camieai?email=${encodeURIComponent(userDetails.email || '')}&name=${encodeURIComponent(userDetails.first_name || '')}`}
        />
      )}
    </div>
  );
}