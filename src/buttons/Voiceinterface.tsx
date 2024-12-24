"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Moon, Sun } from "lucide-react";
import Modal from "@/components/app/MeetingModal";

export default function VoiceInterface() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [bookMeeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const vapi = new Vapi("9c71146b-9068-42b4-8ea5-45e530152dc5");
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);

  // Enhanced event listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("message", (message) => {
      console.log(message);
    });

    vapi.on("message", (message) => {
      if (
        message.type === "function-call" &&
        message.functionCall.name === "bookAppointmentModal"
      ) {
        setBookMeeting(true);
        console.log("clg:", setBookMeeting);
      }
    });
  }, []);

  // Enhanced call start handler
  const startCallInline = async () => {
    try {
      // If already speaking, stop the call
      if (isSpeaking) {
        endCall();
        return;
      }
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // If permission is granted, proceed with starting the call
      setConnecting(true);
      setIsSpeaking(true);
      setMicPermission(true);

      // Start the Vapi call
      const data = await vapi.start(assistantOptions as object);
      console.log(data);
    } catch (error) {
      // Handle permission denial or other errors
      console.error("Microphone access denied:", error);
      setMicPermission(false);
      setIsSpeaking(false);
      setConnecting(false);

      // Optionally, show a user-friendly error message
      alert(
        "Microphone access is required to start the call. Please grant permission."
      );
    }
  };

  // Enhanced end call handler
  const endCall = () => {
    vapi.stop();
    setIsSpeaking(false);
    setConnected(false);
  };

  // Maintained mic tap handler
  const handleMicTap = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      setIsSpeaking((prev) => !prev);
      console.log("Microphone connected:", stream);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setMicPermission(false);
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
  }, [meetingResponse, vapi]);

  // Original assistant options
  const assistantOptions = {
    name: "Vapi's Pizza Front Desk",
    firstMessage: "Hello, how can I help you?",
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer",
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `[Identity]
          Ruby AI Prompt - Luxury Real Estate Investment Opportunity
          Core Personality & Approach
          Maintain a professional, sophisticated tone befitting high-net-worth clients
          Be direct yet consultative, positioning yourself as a luxury real estate investment advisor
          Show genuine interest in understanding the client's investment goals
          Emphasize both the investment security (money-back guarantee) and profit potential
          Initial Qualification Process
          Begin by warmly greeting the prospect and briefly introducing yourself as Ruby, a luxury real estate investment specialist
          Qualify prospects through natural conversation by asking:
          "May I ask what industry you're currently working in?"
          [Wait for response - continue if in real estate]
          "Just to ensure I can provide the most relevant opportunities, could you share your approximate monthly revenue?"
          [Wait for response - continue if >$200k/month]
          If qualifications are met, probe pain points:
          "What challenges have you encountered finding profitable real estate investments in today's market?"
          [Listen for alignment with target pain point]
          Core Offer Presentation
          When prospect is qualified, present the opportunity:
          "Based on what you've shared, I'd like to tell you about an exclusive opportunity we're offering to select real estate professionals. We have a portfolio of premium properties with:
          100% money-back guarantee within the first 3 months if you're not completely satisfied
          Immediate rental potential through Airbnb, generating returns within 1-2 months
          Flexible usage rights - choose between personal use or rental income
          Premium locations selected for maximum ROI potential
          What interests you most about this opportunity?"
          Appointment Booking
          If prospect shows interest, transition to booking:
          "I'd be happy to share more details about specific properties that match your investment criteria. Would you like to schedule a private consultation to explore these opportunities further?"
          If yes → Call bookAppointmentModal function
          Disqualification Handling
          If prospect doesn't meet criteria:
          Thank them for their time
          Mention you'll keep them in mind for future opportunities that better match their situation
          End conversation professionally
          Key Response Variables
          {PROSPECT_NAME} - Client's name
          {MONTHLY_REVENUE} - Stated monthly revenue
          {PAIN_POINTS} - Specific challenges mentioned
          {INTEREST_AREA} - Whether they're more interested in personal use or rental income
          Function Calls
          Verify prospect qualifications before proceeding
          Use bookAppointmentModal function  only after confirming interest
          Log all qualified leads in system
          Safety Protocols
          Never share specific property details before qualification
          Maintain confidentiality of client financial information
          Only proceed with appointment booking for fully qualified prospects
                    
          Greet Mario
          Introduce yourself as Ruby, the virtual receptionist for the dental clinic.
          
          
          Move to the next phase, offering to help them schedule or reschedule an appointment.
          Ask if they are ready to schedule an appointment with the dentist or hygienist.
          Once they agree, directly call the bookAppointmentModal function 
          [The Appointment Booking Process] and remain quiet  till you get a direct response from the user that they completed booking the meeting with the modal.
          `,
        },
      ],
      functions: [
        {
          name: "bookAppointmentModal",
          description: "Used to book the appointment for the user.",
          parameters: {
            type: "object",
            properties: {
              book: {
                type: "boolean",
                description:
                  "This is set to true if the user wants to book a meeting, so as to open the modal.",
              },
            },
          },
        },
      ],
    },
  };

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
      <div className="flex justify-center items-center mt-auto relative w-full max-w-md">
        {/* Mic Card with integrated sound waves */}
        <Card
          className={`
              flex justify-center items-center w-80 h-80 mx-auto rounded-full 
              shadow-2xl transition-all duration-300 ease-in-out relative
              ${
                isSpeaking
                  ? "bg-destructive/10 border-4 border-destructive/50 scale-105"
                  : "bg-primary/10 hover:bg-primary/20"
              }
              cursor-pointer overflow-hidden
            `}
          onClick={startCallInline}
        >
          {/* Sound waves inside the circle when speaking */}
          {(isSpeaking || assistantIsSpeaking) && <SoundWaves />}

          <div className="relative z-10">
            {isSpeaking ? (
              <MicOff
                className="w-40 h-40 text-destructive animate-pulse"
                strokeWidth={1.5}
              />
            ) : (
              <Mic
                className="w-40 h-40 text-primary group-hover:text-primary/80"
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* Pulse effect when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 bg-destructive/20 animate-ping rounded-full"></div>
          )}
        </Card>

        {/* Centered bottom text and theme toggle */}
        <div className="absolute bottom-[-7rem] left-1/2 transform -translate-x-1/2 text-center flex flex-col items-center">
          <p
            className={`
              transition-all duration-300 mb-2
              ${
                isSpeaking
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }
            `}
          >
            {isSpeaking ? "Conversation in Progress" : "Start Conversation"}
          </p>

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

      {/* Modal remains the same */}
      <Modal
        isOpen={bookMeeeting}
        setOpen={setBookMeeting}
        vapiResponse={setMeetingResponse}
      />
    </div>
  );
}
