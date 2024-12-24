import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircleIcon, MicIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";
import axios from "axios";
import VoiceInterface from "./Voiceinterface";

// Bubble Text Component
const BubbleText = ({ text, isVisible }) => {
  return isVisible ? (
    <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
      <div
        className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
        before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
        before:border-l-[6px] before:border-l-transparent 
        before:border-t-[6px] before:border-t-primary 
        before:border-r-[6px] before:border-r-transparent"
      >
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

  // useRef to store timers for cleanup
  const timers = useRef([]);

  // Fetch dynamic text and handle visibility/timing of bubble
  useEffect(() => {
    const fetchDynamicText = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/leads-note",
          { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
          { headers: { "Content-Type": "application/json" } }
        );

        const randomText = response.data.msg;
        setBubbleText(randomText);
        setIsBubbleVisible(true);

        // Timer to hide the bubble after 8 seconds
        const hideBubbleTimer = setTimeout(() => {
          setIsBubbleVisible(false);
          setBubbleText("");
        }, 8000);

        // Timer to fetch new text after 20 seconds
        const nextTextTimer = setTimeout(() => {
          setBubbleText("");
          fetchDynamicText();
        }, 20000);

        // Store timers in useRef to clear them on cleanup
        timers.current = [hideBubbleTimer, nextTextTimer];
      } catch (error) {
        console.error("Failed to fetch dynamic text", error);
      }
    };

    // Initial fetch
    fetchDynamicText();
<<<<<<< HEAD
  }, [campaign_id]);
=======

    // Cleanup function to clear timers when component unmounts or re-renders
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []); // Empty dependency array ensures this runs only once
>>>>>>> 276383d3fb09696250a5f39e3ce2af434485e7e7

  const handleButtonClick = () => {
    setIsVisible(false);
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setModalType("");
    setIsOpen(false);
    setIsVisible(true);
  };

  const handleSelection = (type) => {
    setModalType(type);
    setIsOpen(false);
  };

  const handleModalClose = () => {
    setModalType("");
    setIsVisible(true); // Show button when closing chat/voice modal
  };

  return (
    <div>
      {isVisible && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
          <div className="relative w-full">
            <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
            <button
              className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
              onClick={handleButtonClick}
<<<<<<< HEAD
=======
              aria-label="Open communication options"
>>>>>>> 276383d3fb09696250a5f39e3ce2af434485e7e7
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
            </button>
          </div>
        </div>
      )}

      {/* Communication Options Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1200px] p-4 md:p-10">
          <h2 className="text-xl md:text-3xl font-semibold text-center mb-4 md:mb-8">
            How do you want us to communicate?
          </h2>

          <video
            autoPlay
            loop
            muted
            className="h-32 md:h-64 w-full object-contain rounded-xl mb-2"
          >
            <source src="/src/assets/hi.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-10 mt-4">
            <div
              className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("chat")}
            >
              <MessageCircleIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold">Chat with Me</h3>
              <p className="text-xs md:text-base text-gray-600 text-center">
                Text-based communication for quick exchanges.
              </p>
            </div>

            <div
              className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all"
              onClick={() => handleSelection("voice")}
            >
              <MicIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold">
                Talk with Audio
              </h3>
              <p className="text-xs md:text-base text-gray-600 text-center">
                Voice-based interaction for more personal conversations.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      {modalType === "chat" && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
<<<<<<< HEAD
            <ChatInterface />
=======
            <ChatInterface handleModalClose={handleModalClose} />
>>>>>>> 276383d3fb09696250a5f39e3ce2af434485e7e7
          </DialogContent>
        </Dialog>
      )}

      {/* Voice Modal */}
      {modalType === "voice" && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-center">
              Tap to speak
            </h2>
            <VoiceInterface />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
