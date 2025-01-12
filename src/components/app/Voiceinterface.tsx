"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Moon, Sun } from "lucide-react";
import Modal from "./MeetingModal";
import axios from "axios";

export function VoiceInterface({ campaign_id }: { campaign_id: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [connecting, setConnecting] = useState(false);
  const [assistantOptions, setAssistantOptions] = useState(null);
  const [connected, setConnected] = useState(false);
  const [ctaText, setCtaText] = useState("Book Appointment");
  const [bookMeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [setUpMessage, setSetUpMessage] = useState(
    "Setting up audio channels..."
  );
  const [link, setLink] = useState(null);

  // Create a ref to store the Vapi instance
  const vapiRef = React.useRef(
    new Vapi("9c71146b-9068-42b4-8ea5-45e530152dc5")
  );
  const vapi = vapiRef.current;
  // Enhanced event listeners
  useEffect(() => {
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      console.log("Call has started.");
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
      setIsSpeaking(false);
      console.log("Call has ended.");
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("message", (message) => {
      console.log(message);
      if (
        message.type === "function-call" &&
        message.functionCall.name === "bookAppointmentModal"
      ) {
        setBookMeeting(true);
      }
    });

    // Cleanup on unmount
    return () => {
      vapi.stop();
    };
  }, []);

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
      } catch (error) {
        console.error("Failed to fetch CTA text:", error);
        setCtaText("Book Appointment");
      }
    };

    fetchCtaText();
  }, []);

  //fetch assiatant config
  useEffect(() => {
    const assistantConfig = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/voice",
          {
            campaign_id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        setAssistantOptions(response.data.data.assistant);
        setLink(response.data.data.meeting_link);
      } catch (error) {
        console.error("Error fetching assistant:", error);
      }
    };

    assistantConfig();
  }, []);

  const handleSelection = () => {
    setBookMeeting(true);
  };

  // Fixed end call handler
  const endCall = async () => {
    try {
      setIsSpeaking(false);
      setConnecting(false);
      setConnected(false);
      // Use the ref to access the Vapi instance
      vapiRef.current.stop();
      console.log("Call ended successfully");
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  // Enhanced call start handler
  const startCallInline = async () => {
    if (assistantOptions) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setConnecting(true);
        setIsSpeaking(true);
        setMicPermission(true);

        // Use the ref to access the Vapi instance
        await vapiRef.current.start(assistantOptions as object);
      } catch (error) {
        console.error("Microphone access denied:", error);
        setMicPermission(false);
        setIsSpeaking(false);
        setConnecting(false);
        alert(
          "Microphone access is required to start the call. Please grant permission."
        );
      }
    } else {
      console.log(assistantOptions);
      alert(" Sorry Can't start call.");
    }
  };

  // Meeting response handler
  useEffect(() => {
    if (meetingResponse) {
      console.log(meetingResponse);
      vapi.send({
        type: "add-message",
        message: {
          role: "system",
          content: meetingResponse,
        },
      });
    }
  }, [meetingResponse, vapiRef]);

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

    // Get a random index
    const randomIndex = Math.floor(Math.random() * voiceLoadingMessages.length);

    // Return the random message
    return voiceLoadingMessages[randomIndex];
  }

  useEffect(() => {
    function displayLoadingMessage() {
      // Update message every 2 seconds
      const interval = setInterval(() => {
        setSetUpMessage(getRandomVoiceLoadingMessage());
      }, 2000);

      if (assistantOptions) {
        clearInterval(interval);
      }
    }

    displayLoadingMessage();
  }, [assistantOptions]);

  // Render sound waves animation
  const SoundWaves = () => (
    <div className="absolute inset-0 flex justify-center items-center z-0 overflow-hidden">
      {[1, 2, 3].map((wave) => (
        <div
          key={wave}
          className={`absolute h-[12px] w-36 
            ${resolvedTheme === "dark" ? "bg-primary/30 " : "bg-primary/50 "}
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
              {connecting || connected
                ? connected
                  ? assistantIsSpeaking
                    ? "Voice assistant is speaking"
                    : "Conversation in Progress"
                  : "Please wait connecting voice assistant"
                : "Start Conversation"}
            </p>

            {/* CTA Button */}
            <button
              onClick={() => handleSelection()}
              className="w-full min-w-[200px] bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              {ctaText}
            </button>

            {/* Theme toggle button */}
            <Button
              variant="outline"
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
          </div>
        </div>
      ) : (
        setUpMessage
      )}

      {/* Modal remains the same */}
      <Modal
        isOpen={bookMeeting}
        setOpen={setBookMeeting}
        vapiResponse={setMeetingResponse}
        link={link!}
      />
    </div>
  );
}
