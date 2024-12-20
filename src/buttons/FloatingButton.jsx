// import { useEffect, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import { ModeToggle } from "../modes";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute md:-top-24 -top-20 md:-left-16 -left-12 z-50">
//       <div
//         className="relative bg-white text-primary border border-primary px-2 py-3 max-w-[200px] md:max-w-xs rounded-3xl shadow-lg text-xs md:text-sm text-wrap
//         before:content-[''] before:absolute before:bottom-[-6px] before:right-4 before:w-0 before:h-0
//         before:border-l-[6px] before:border-l-transparent
//         before:border-t-[6px] before:border-t-primary
//         before:border-r-[6px] before:border-r-transparent"
//       >
//         {text}
//       </div>
//     </div>
//   ) : null;
// };

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const responses = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           {
//             campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const randomText = responses.data.msg;
//         setBubbleText(randomText);
//         setIsBubbleVisible(true);

//         const timer = setTimeout(() => {
//           setIsBubbleVisible(false);
//           setBubbleText("");
//         }, 8000);

//         const nextTimer = setTimeout(() => {
//           setBubbleText("");
//           fetchDynamicText();
//         }, 20000);

//         return () => {
//           clearTimeout(timer);
//           clearTimeout(nextTimer);
//         };
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     fetchDynamicText();
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-5 md:right-5 z-50">
//           <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//           <div
//             className="flex h-14 w-14 md:h-20 md:w-20 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce cursor-pointer"
//             onClick={handleButtonClick}
//           >
//             <video
//               autoPlay
//               loop
//               muted
//               className="h-full w-full object-contain rounded-full"
//             >
//               <source src="/src/assets/hi.mp4" type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1200px] p-4 md:p-10">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-4 md:mb-8">
//             How do you want us to communicate?
//           </h2>

//           <video
//             autoPlay
//             loop
//             muted
//             className="h-40 md:h-64 w-full object-contain rounded-xl mb-2"
//           >
//             <source src="/src/assets/hi.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>

//           <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-10 mt-auto mb-auto">
//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-10 w-10 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">Chat with Me</h3>
//               <p className="text-sm md:text-base text-gray-600 text-center">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-10 w-10 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">
//                 Talk with Audio
//               </h3>
//               <p className="text-sm md:text-base text-gray-600 text-center">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px] mt-auto mb-auto">
//             <ChatInterface />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={() => setModalType("")}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <div className="flex justify-end items-end">
//               <ModeToggle />
//             </div>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircleIcon, MicIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";
import { ModeToggle } from "../modes";
import axios from "axios";
import VoiceInterface from "./Voiceinterface";

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

export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [modalType, setModalType] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

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
        setBubbleText(randomText);
        setIsBubbleVisible(true);

        const timer = setTimeout(() => {
          setIsBubbleVisible(false);
          setBubbleText("");
        }, 8000);

        const nextTimer = setTimeout(() => {
          setBubbleText("");
          fetchDynamicText();
        }, 20000);

        return () => {
          clearTimeout(timer);
          clearTimeout(nextTimer);
        };
      } catch (error) {
        console.error("Failed to fetch dynamic text", error);
      }
    };

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
      {isVisible && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
          <div className="relative w-full">
            <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
            <button
              className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
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
            </button>
          </div>
        </div>
      )}

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

      {modalType === "chat" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
            <ChatInterface />
          </DialogContent>
        </Dialog>
      )}

      {modalType === "voice" && (
        <Dialog open={true} onOpenChange={() => setModalType("")}>
          <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-center">
              Tap to speak
            </h2>
            <div className="flex justify-end items-end">
              <ModeToggle />
            </div>
            <VoiceInterface />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
