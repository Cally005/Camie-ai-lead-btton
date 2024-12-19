 "use client";

import { React,  useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, MicIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";

import { ModeToggle } from "../modes";
import axios from "axios";
import VoiceInterface from "./Voiceinterface";

const BubbleText = ({ text, isVisible }) => {
  return isVisible ? (
    <div className="absolute -top-24 -left-16 z-50 animate-bounce">
      <div className="relative bg-white text-primary border border-primary px-2 py-3 max-w-xs rounded-3xl shadow-lg text-sm text-wrap
        before:content-[''] before:absolute before:bottom-[-6px] before:left-4 before:w-0 before:h-0 
        before:border-l-[6px] before:border-l-transparent 
        before:border-t-[6px] before:border-t-primary 
        before:border-r-[6px] before:border-r-transparent">
        {text}
      </div>
    </div>
  ) : null;
};


// Floating Button Component
export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [modalType, setModalType] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Simulate fetching dynamic text from backend
  useEffect(() => {
    const fetchDynamicText = async () => {
      try {
        const responses = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/leads-note",
                  {
                    campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

        const randomText = responses.data.msg;
        
        // Show bubble
        setBubbleText(randomText);
        setIsBubbleVisible(true);

        // Hide bubble after 8 seconds
        const timer = setTimeout(() => {
          setIsBubbleVisible(false);
        }, 8000);

        // Prepare next bubble appearance
        const nextTimer = setTimeout(() => {
          fetchDynamicText();
        }, 8000);

        // Cleanup timers
        return () => {
          clearTimeout(timer);
          clearTimeout(nextTimer);
        };
      } catch (error) {
        console.error("Failed to fetch dynamic text", error);
      }
    };

    // Initial call
    fetchDynamicText();
  }, []);

  const handleButtonClick = () => {
    setIsVisible(false);
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setIsVisible(true);
  };

  const handleSelection = (type) => {
    setModalType(type);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Fixed positioning at bottom right of screen */}
      {isVisible && (
        <div className="fixed bottom-5 right-5 z-50">
             <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
          <div
            className="flex h-20 w-20 left-10 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
            onClick={handleButtonClick}
          >
            <video
              autoPlay
              loop
              muted
              className="h-full w-full object-contain rounded-full"
            >
              <source src="/src/assets/hi.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
 {/* Initial Popup Modal */}
 <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex flex-col items-center gap-8 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1200px] p-10">
          <h2 className="text-3xl font-semibold text-center mb-8">How do you want us to communicate?</h2>

          {/* Video between title and cards */}
          <video
            autoPlay
            loop
            muted
            className="h-64 w-full object-contain rounded-xl mb-2"
          >
            <source src="/src/assets/hi.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Cards for Chat with Me and Talk with Audio */}
          <div className="flex w-full justify-between gap-10 mt-auto mb-auto">
            {/* Card 1: Chat with Me */}
            <div
              className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("chat")}
            >
              <MessageCircleIcon className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">Chat with Me</h3>
              <p className="text-gray-600">Text-based communication for quick exchanges.</p>
            </div>

            {/* Card 2: Talk with Audio */}
            <div
              className="flex-1 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("voice")}
            >
              <MicIcon className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">Talk with Audio</h3>
              <p className="text-gray-600">Voice-based interaction for more personal conversations.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for Chat */}
      {modalType === "chat" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex  items-center justify-center rounded-lg w-[40vw] h-[90vh] max-w-[1200px]  mt-auto mb-auto">
            {/* <h2 className="text-2xl font-semibold text-center">Chat with Me</h2> */}
            {/* Embed ChatComponent */}
          
            <div className="">
           
           
              </div>
           {/* Display your chat UI here */}
           <ChatInterface />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal for Voice */}
      {modalType === "voice" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[80vw] h-[80vh] max-w-[1000px] p-8">
            <h2 className="text-2xl font-semibold text-center">Tap to speak</h2>
          
            {/* Audio UI */}
            <div className="flex justify-end items-end">
            <ModeToggle></ModeToggle>
              </div>
          <VoiceInterface/>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


