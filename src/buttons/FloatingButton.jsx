import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircleIcon, MicIcon, XIcon, CalendarIcon } from "lucide-react";
import ChatInterface from "./ChatInterface";
import axios from "axios";
import VoiceInterface from "./Voiceinterface";
import Modal from "@/components/app/MeetingModal";

const BubbleText = ({ text, isVisible }) => {
  return isVisible ? (
    <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
      <div className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
        before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
        before:border-l-[6px] before:border-l-transparent 
        before:border-t-[6px] before:border-t-primary 
        before:border-r-[6px] before:border-r-transparent">
        {text}
      </div>
    </div>
  ) : null;
};

export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [modalType, setModalType] = useState("");
  const [dynamicText, setDynamicText] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [bookMeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBox(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDynamicText = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/leads-note",
          { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
          { headers: { "Content-Type": "application/json" } }
        );

        setBubbleText(response.data.msg);
        setIsBubbleVisible(true);
        setDynamicText(response.data.msg);

        const hideBubbleTimer = setTimeout(() => {
          setIsBubbleVisible(false);
        }, 8000);

        const nextTextTimer = setTimeout(() => {
          setBubbleText("");
          fetchDynamicText();
        }, 20000);

        timers.current = [hideBubbleTimer, nextTextTimer];
      } catch (error) {
        console.error("Failed to fetch dynamic text:", error);
        setBubbleText("");
        setDynamicText("");
      }
    };

    fetchDynamicText();

    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const fetchCtaText = async () => {
      try {
        const response = await axios.post("https://camie-ai.onrender.com/api/v0/ai/call-to-action");
        setCtaText(response.data.data.call_to_action || "Book Appointment");
      } catch (error) {
        console.error("Failed to fetch CTA text:", error);
      }
    };

    fetchCtaText();
  }, []);

  useEffect(() => {
    if (meetingResponse) {
      handleAppointmentModalClose();
    }
  }, [meetingResponse]);

  const handleButtonClick = () => {
    setShowBox(false);
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setModalType("");
    setIsOpen(false);
  };

  const handleSelection = (type) => {
    setModalType(type);
    setBookMeeting(type === "appointment");
    setIsOpen(false);
  };

  const handleModalClose = () => {
    setModalType("");
    setBookMeeting(false);
  };

  const handleCloseBox = () => {
    setShowBox(false);
  };

  const handleAppointmentModalClose = () => {
    setBookMeeting(false);
    setModalType("");
  };

  return (
    <div>
      {showBox && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md relative">
            <button 
              onClick={handleCloseBox}
              className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
            >
              <XIcon className="h-4 w-4 text-gray-600" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src="/src/assets/love.gif"
                  alt="Love animation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm md:text-base text-gray-800 mb-4">
                  Hey! Wanna Know more about me?
                </p>
                <button
                  onClick={handleButtonClick}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
        <div className="relative w-full">
          <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
          <button
            className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce overflow-hidden"
            onClick={handleButtonClick}
            aria-label="Open communication options"
          >
            <img
              src="/src/assets/love.gif"
              alt="Love animation"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
            How do you want us to communicate?
          </h2>

          <img
            src="/src/assets/love.gif"
            alt="Love animation"
            className="h-24 md:h-48 w-full object-contain rounded-sm"
          />

          <div className={`grid grid-cols-1 ${ctaText === "Book Appointment" ? 'md:grid-cols-3' : 'md:grid-cols-2'} w-full gap-4 md:gap-6 mt-28 px-2 md:px-4 ${ctaText !== "Book Appointment" ? 'md:w-2/3 mx-auto' : ''}`}>
            <div
              className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
              onClick={() => handleSelection("chat")}
            >
              <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
              <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
                Text-based communication for quick exchanges.
              </p>
            </div>

            <div
              className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
              onClick={() => handleSelection("voice")}
            >
              <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
              <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
                Voice-based interaction for more personal conversations.
              </p>
            </div>

            {ctaText === "Book Appointment" && (
              <div
                className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
                onClick={() => handleSelection("appointment")}
              >
                <CalendarIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
                <h3 className="text-base md:text-lg font-semibold">{ctaText}</h3>
                <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
                  Schedule a time that works best for you.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {modalType === "chat" && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
            <ChatInterface handleModalClose={handleModalClose} />
          </DialogContent>
        </Dialog>
      )}

      {modalType === "voice" && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
            <h2 className="text-xl md:text-2xl font-semibold text-center">
              Tap to speak
            </h2>
            <VoiceInterface />
          </DialogContent>
        </Dialog>
      )}

      {modalType === "appointment" && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <Modal
            isOpen={bookMeeting}
            setOpen={setBookMeeting}
            className="w-full h-full"
            setMeeting={setMeetingResponse}
          />
        </Dialog>
      )}
    </div>
  );
}

export default FloatingButton;

//working well
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon, XIcon, CalendarIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";
// import Modal from "@/components/app/MeetingModal";

// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
//       <div className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
//         before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
//         before:border-l-[6px] before:border-l-transparent 
//         before:border-t-[6px] before:border-t-primary 
//         before:border-r-[6px] before:border-r-transparent">
//         {text}
//       </div>
//     </div>
//   ) : null;
// };

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showBox, setShowBox] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);
//   const [ctaText, setCtaText] = useState("Book Appointment");
//   const [bookMeeting, setBookMeeting] = useState(false);
//   const [meetingResponse, setMeetingResponse] = useState(null);
//   const timers = useRef([]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowBox(true);
//     }, 20000);

//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         setBubbleText(response.data.msg);
//         setIsBubbleVisible(true);
//         setDynamicText(response.data.msg);

//         const hideBubbleTimer = setTimeout(() => {
//           setIsBubbleVisible(false);
//         }, 8000);

//         const nextTextTimer = setTimeout(() => {
//           setBubbleText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current = [hideBubbleTimer, nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text:", error);
//         setBubbleText("");
//         setDynamicText("");
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   useEffect(() => {
//     const fetchCtaText = async () => {
//       try {
//         const response = await axios.get("https://your-api-endpoint/cta-text");
//         setCtaText(response.data.cta || "Book Appointment");
//       } catch (error) {
//         console.error("Failed to fetch CTA text:", error);
//       }
//     };

//     fetchCtaText();
//   }, []);

//   useEffect(() => {
//     if (meetingResponse) {
//       handleAppointmentModalClose();
//     }
//   }, [meetingResponse]);

//   const handleButtonClick = () => {
//     setShowBox(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setBookMeeting(type === "appointment");
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setBookMeeting(false);
//   };

//   const handleCloseBox = () => {
//     setShowBox(false);
//   };

//   const handleAppointmentModalClose = () => {
//     setBookMeeting(false);
//     setModalType("");
//   };

//   return (
//     <div>
//       {/* Top Box */}
//       {showBox && (
//         <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-4 max-w-md relative">
//             <button 
//               onClick={handleCloseBox}
//               className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
//             >
//               <XIcon className="h-4 w-4 text-gray-600" />
//             </button>
            
//             <div className="flex items-start gap-4">
//               <div className="w-16 h-16 flex-shrink-0">
//                 <img
//                   src="/src/assets/love.gif"
//                   alt="Love animation"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 <p className="text-sm md:text-base text-gray-800 mb-4">
//                   {/* {dynamicText} */} Hey! Wanna Know more about me?
//                 </p>
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//                 >
//                 Learn More
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Floating Button with Bubble */}
//       <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
//         <div className="relative w-full">
//           <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//           <button
//             className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce overflow-hidden"
//             onClick={handleButtonClick}
//             aria-label="Open communication options"
//           >
//             <img
//               src="/src/assets/love.gif"
//               alt="Love animation"
//               className="h-full w-full object-cover"
//             />
//           </button>
//         </div>
//       </div>

//       {/* Rest of the dialogs remain the same */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             {/* Chat, Voice, and Appointment options remain the same */}
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("appointment")}
//             >
//               <CalendarIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">{ctaText}</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Schedule a time that works best for you.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Modal interfaces remain the same */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "appointment" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <Modal
//             isOpen={bookMeeting}
//             setOpen={setBookMeeting}
//             className="w-full h-full"
//             setMeeting={setMeetingResponse}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// }

// export default FloatingButton;



//works well just want to add the round buton
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon, XIcon, CalendarIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";
// import Modal from "@/components/app/MeetingModal";

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");
//   const [ctaText, setCtaText] = useState("Book Appointment"); // Default fallback
//   const [bookMeeeting, setBookMeeting] = useState(false);
//   const [meetingResponse, setMeetingResponse] = useState(null);
//   const timers = useRef([]);

//   // Fetch dynamic text with timer
//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         setDynamicText(response.data.msg);

//         const nextTextTimer = setTimeout(() => {
//           setDynamicText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current.push(nextTextTimer);
//       } catch (error) {
//         console.error("Failed to fetch dynamic text:", error);
//         setDynamicText("");
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//       timers.current = [];
//     };
//   }, []);

//   // Fetch CTA text once
//   useEffect(() => {
//     const fetchCtaText = async () => {
//       try {
//         const response = await axios.get(
//           "https://your-api-endpoint/cta-text"
//         );
//         setCtaText(response.data.cta || "Book Appointment");
//       } catch (error) {
//         console.error("Failed to fetch CTA text:", error);
//         setCtaText("Book Appointment");
//       }
//     };

//     fetchCtaText();
//   }, []);


//   useEffect(() =>{
//     if(meetingResponse){
//       console.log(meetingResponse)
//       handleAppointmentModalClose()

//     }
//   }, [meetingResponse])

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setBookMeeting(true);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//     setBookMeeting(false);
//   };

//   const handleCloseBox = () => {
//     setIsVisible(false);
//   };

//   const handleAppointmentModalClose = () => {
//     setBookMeeting(false);
//     setModalType("");
//     setIsVisible(true);
//   };

//   return (
//     <div>
//       {/* Floating Box with Dynamic Text */}
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-4 max-w-md relative">
//             <button 
//               onClick={handleCloseBox}
//               className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
//               aria-label="Close"
//             >
//               <XIcon className="h-4 w-4 text-gray-600" />
//             </button>
            
//             <div className="flex items-start gap-4">
//               <div className="w-16 h-16 flex-shrink-0">
//                 <img
//                   src="/src/assets/love.gif"
//                   alt="Love animation"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 {/* Dynamic Text Display */}
//                 <p className="text-sm md:text-base text-gray-800 mb-4">
//                   {dynamicText}
//                 </p>
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//                 >
//                   Click Me
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Dialog */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             {/* Chat Option */}
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             {/* Voice Option */}
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>

//             {/* Appointment Option with CTA Text */}
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("appointment")}
//             >
//               <CalendarIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               {/* CTA Text Display */}
//               <h3 className="text-base md:text-lg font-semibold">{ctaText}</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Schedule a time that works best for you.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Chat Interface Dialog */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Voice Interface Dialog */}
//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Appointment Modal */}
//       {modalType === "appointment" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <Modal
//             isOpen={bookMeeeting}
//             setOpen={setBookMeeting}
//             className="w-full h-full"
//             setMeeting={setMeetingResponse}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// }









// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon, XIcon, CalendarIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";
// import Modal from "@/components/app/MeetingModal";

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");
//   const [ctaText, setCtaText] = useState("");
//   const [bookMeeeting, setBookMeeting] = useState(false);
//   const timers = useRef([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch dynamic text
//         const textResponse = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );
        
//         // Fetch CTA text (replace with your actual endpoint)
//         const ctaResponse = await axios.get(
//           "https://your-api-endpoint/cta-text"
//         );

//         setDynamicText(textResponse.data.msg);
//         setCtaText(ctaResponse.data.cta || "Book Appointment"); // Fallback text

//         const nextTextTimer = setTimeout(() => {
//           setDynamicText("");
//           fetchData();
//         }, 20000);

//         timers.current = [nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch data", error);
//         setCtaText("Book Appointment"); // Fallback if fetch fails
//       }
//     };

//     fetchData();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setBookMeeting(true);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//   };

//   const handleCloseBox = () => {
//     setIsVisible(false);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-4 max-w-md relative">
//             <button 
//               onClick={handleCloseBox}
//               className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
//               aria-label="Close"
//             >
//               <XIcon className="h-4 w-4 text-gray-600" />
//             </button>
            
//             <div className="flex items-start gap-4">
//               <div className="w-16 h-16 flex-shrink-0">
//                 <img
//                   src="/src/assets/love.gif"
//                   alt="Love animation"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 <p className="text-sm md:text-base text-gray-800 mb-4">
//                   {dynamicText}
//                 </p>
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//                 >
//                   Click Me
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("appointment")}
//             >
//               <CalendarIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">{ctaText}</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Schedule a time that works best for you.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}


// {modalType === "appointment" && (
//     <Dialog open={true} onOpenChange={handleModalClose}>
    
//         <Modal
//           isOpen={bookMeeeting}
//           setOpen={setBookMeeting}
//           className="w-full h-full"
//           onclick={handleDialogClose}  // Add this prop to handle modal closing
//         />
 
//     </Dialog>
//   )}

//     </div>
//   );
// }


// cancel button added 
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon, XIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");

//   const timers = useRef([]);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         const randomText = response.data.msg;
//         setDynamicText(randomText);

//         const nextTextTimer = setTimeout(() => {
//           setDynamicText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current = [nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//   };

//   const handleCloseBox = () => {
//     setIsVisible(false);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-4 max-w-md relative">
//             {/* Close Button */}
//             <button 
//               onClick={handleCloseBox}
//               className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
//               aria-label="Close"
//             >
//               <XIcon className="h-4 w-4 text-gray-600" />
//             </button>
            
//             <div className="flex items-start gap-4">
//               <div className="w-16 h-16 flex-shrink-0">
//                 <img
//                   src="/src/assets/love.gif"
//                   alt="Love animation"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 <p className="text-sm md:text-base text-gray-800 mb-4">
//                   {dynamicText}
//                 </p>
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//                 >
//                   Click Me
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }


















// working well just that no close button
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// // Bubble Text Component is no longer needed as we're integrating the text directly

// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");

//   const timers = useRef([]);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         const randomText = response.data.msg;
//         setDynamicText(randomText);

//         const nextTextTimer = setTimeout(() => {
//           setDynamicText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current = [nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
//           <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
//             <div className="flex items-start gap-4">
//               <div className="w-16 h-16 flex-shrink-0">
//                 <img
//                   src="/src/assets/love.gif"
//                   alt="Love animation"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="flex-grow">
//                 <p className="text-sm md:text-base text-gray-800 mb-4">
//                   {dynamicText}
//                 </p>
//                 <button
//                   onClick={handleButtonClick}
//                   className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
//                 >
//                   Click Me
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }
























//working perfectly
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// // Bubble Text Component
// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
//       <div
//         className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
//         before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
//         before:border-l-[6px] before:border-l-transparent 
//         before:border-t-[6px] before:border-t-primary 
//         before:border-r-[6px] before:border-r-transparent"
//       >
//         {text}
//       </div>
//     </div>
//   ) : null;
// };

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);

//   const timers = useRef([]);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         const randomText = response.data.msg;
//         setBubbleText(randomText);
//         setIsBubbleVisible(true);

//         const hideBubbleTimer = setTimeout(() => {
//           setIsBubbleVisible(false);
//           setBubbleText("");
//         }, 8000);

//         const nextTextTimer = setTimeout(() => {
//           setBubbleText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current = [hideBubbleTimer, nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
//           <div className="relative w-full">
//             <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//             <button
//               className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce overflow-hidden"
//               onClick={handleButtonClick}
//               aria-label="Open communication options"
//             >
//               <img
//                 src="/src/assets/love.gif"
//                 alt="Love animation"
//                 className="h-full w-full object-cover"
//               />
//             </button>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-2 md:mb-4">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-24 md:h-48 w-full object-contain rounded-sm"
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 md:gap-6 mt-28 px-2 md:px-4">
//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="p-3 md:p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-6 w-6 md:h-12 md:w-12 text-primary" />
//               <h3 className="text-base md:text-lg font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-sm text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }















//working well just a bit of responsiveness 
// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// // Bubble Text Component
// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
//       <div
//         className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
//         before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
//         before:border-l-[6px] before:border-l-transparent 
//         before:border-t-[6px] before:border-t-primary 
//         before:border-r-[6px] before:border-r-transparent"
//       >
//         {text}
//       </div>
//     </div>
//   ) : null;
// };

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);

//   const timers = useRef([]);

//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         const randomText = response.data.msg;
//         setBubbleText(randomText);
//         setIsBubbleVisible(true);

//         const hideBubbleTimer = setTimeout(() => {
//           setIsBubbleVisible(false);
//           setBubbleText("");
//         }, 8000);

//         const nextTextTimer = setTimeout(() => {
//           setBubbleText("");
//           fetchDynamicText();
//         }, 20000);

//         timers.current = [hideBubbleTimer, nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     fetchDynamicText();

//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []);

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true);
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
//           <div className="relative w-full">
//             <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//             <button
//               className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce overflow-hidden"
//               onClick={handleButtonClick}
//               aria-label="Open communication options"
//             >
//               <img
//                 src="/src/assets/love.gif"
//                 alt="Love animation"
//                 className="h-full w-full object-cover"
//               />
//             </button>
//           </div>
//         </div>
//       )}

//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1200px] p-4 md:p-10 dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-4 md:mb-8">
//             How do you want us to communicate?
//           </h2>

//           <img
//             src="/src/assets/love.gif"
//             alt="Love animation"
//             className="h-32 md:h-64 w-full object-contain rounded-sm mb-2"
//           />

//           <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-10 mt-4">
//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-base text-gray-600 text-center dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">Talk with Audio</h3>
//               <p className="text-xs md:text-base text-gray-600 text-center dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }


































// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { MessageCircleIcon, MicIcon } from "lucide-react";
// import ChatInterface from "./ChatInterface";
// import axios from "axios";
// import VoiceInterface from "./Voiceinterface";

// // Bubble Text Component
// const BubbleText = ({ text, isVisible }) => {
//   return isVisible ? (
//     <div className="absolute bottom-full mb-4 right-0 z-50 w-48 md:w-64 transform translate-y-[-8px]">
//       <div
//         className="relative bg-white text-primary border border-primary px-4 py-3 rounded-3xl shadow-lg text-xs md:text-sm
//         before:content-[''] before:absolute before:bottom-[-6px] before:right-8 before:w-0 before:h-0 
//         before:border-l-[6px] before:border-l-transparent 
//         before:border-t-[6px] before:border-t-primary 
//         before:border-r-[6px] before:border-r-transparent"
//       >
//         {text}
//       </div>
//     </div>
//   ) : null;
// };

// // Floating Button Component
// export function FloatingButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [modalType, setModalType] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);

//   // useRef to store timers for cleanup
//   const timers = useRef([]);

//   // Fetch dynamic text and handle visibility/timing of bubble
//   useEffect(() => {
//     const fetchDynamicText = async () => {
//       try {
//         const response = await axios.post(
//           "https://camie-ai.onrender.com/api/v0/ai/leads-note",
//           { campaign_id: "e3d83007-37bd-4bfc-a186-c542f3ce5d49" },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         const randomText = response.data.msg;
//         setBubbleText(randomText);
//         setIsBubbleVisible(true);

//         // Timer to hide the bubble after 8 seconds
//         const hideBubbleTimer = setTimeout(() => {
//           setIsBubbleVisible(false);
//           setBubbleText("");
//         }, 8000);

//         // Timer to fetch new text after 20 seconds
//         const nextTextTimer = setTimeout(() => {
//           setBubbleText("");
//           fetchDynamicText();
//         }, 20000);

//         // Store timers in useRef to clear them on cleanup
//         timers.current = [hideBubbleTimer, nextTextTimer];
//       } catch (error) {
//         console.error("Failed to fetch dynamic text", error);
//       }
//     };

//     // Initial fetch
//     fetchDynamicText();

//     // Cleanup function to clear timers when component unmounts or re-renders
//     return () => {
//       timers.current.forEach(clearTimeout);
//     };
//   }, []); // Empty dependency array ensures this runs only once

//   const handleButtonClick = () => {
//     setIsVisible(false);
//     setIsOpen(true);
//   };

//   const handleDialogClose = () => {
//     setModalType("");
//     setIsOpen(false);
//     setIsVisible(true);
//   };

//   const handleSelection = (type) => {
//     setModalType(type);
//     setIsOpen(false);
//   };

//   const handleModalClose = () => {
//     setModalType("");
//     setIsVisible(true); // Show button when closing chat/voice modal
//   };

//   return (
//     <div>
//       {isVisible && (
//         <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
//           <div className="relative w-full">
//             <BubbleText text={bubbleText} isVisible={isBubbleVisible} />
//             <button
//               className="relative flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none animate-bounce"
//               onClick={handleButtonClick}
//               aria-label="Open communication options"
//             >
//               <video
//                 autoPlay
//                 loop
//                 muted
//                 className="h-full w-full object-contain rounded-full"
//               >
//                 <source src="/src/assets/love.gif" type="video/gif" />
//                 Your browser does not support the video tag.
//               </video>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Communication Options Dialog */}
//       <Dialog open={isOpen} onOpenChange={handleDialogClose}>
//         <DialogContent className="flex flex-col items-center gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1200px] p-4 md:p-10 dark:bg-gray-900 dark:text-white">
//           <h2 className="text-xl md:text-3xl font-semibold text-center mb-4 md:mb-8">
//             How do you want us to communicate?
//           </h2>

//           <video
//             autoPlay
//             loop
//             muted
//             className="h-32 md:h-64 w-full object-contain rounded-sm mb-2   "
//           >
//             <source src="/src/assets/love.gif" type="video/gif" />
//             Your browser does not support the video tag.
//           </video>

//           <div className="flex flex-col md:flex-row w-full justify-between gap-4 md:gap-10 mt-4 ">
//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all dark:bg-gray-800"
//               onClick={() => handleSelection("chat")}
//             >
//               <MessageCircleIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">Chat with Me</h3>
//               <p className="text-xs md:text-base text-gray-600 text-center  dark:text-white">
//                 Text-based communication for quick exchanges.
//               </p>
//             </div>

//             <div
//               className="flex-1 p-4 md:p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 md:gap-4 cursor-pointer hover:bg-primary/10 transition-all  dark:bg-gray-800"
//               onClick={() => handleSelection("voice")}
//             >
//               <MicIcon className="h-8 w-8 md:h-16 md:w-16 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold">
//                 Talk with Audio
//               </h3>
//               <p className="text-xs md:text-base text-gray-600 text-center  dark:text-white">
//                 Voice-based interaction for more personal conversations.
//               </p>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Chat Modal */}
//       {modalType === "chat" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px]">
//             <ChatInterface handleModalClose={handleModalClose} />
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Voice Modal */}
//       {modalType === "voice" && (
//         <Dialog open={true} onOpenChange={handleModalClose}>
//           <DialogContent className="flex flex-col items-center gap-4 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-8 dark:bg-gray-900 dark:text-white">
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Tap to speak
//             </h2>
//             <VoiceInterface />
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }
