import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CommunicationModal from "@/components/app/CommunicationModal";

export function FloatingButton({ campaign_id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [modalType, setModalType] = useState("");
  const [dynamicText, setDynamicText] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [bookMeeting, setBookMeeting] = useState(false);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const fetchIntervalRef = useRef(null);
  const shouldFetch = useRef(true);
  const [chatTheme, setChatTheme] = useState(false);
  const [voiceTheme, setVoiceTheme] = useState(false);
  // Add chatHistory state for persistence
  const [chatHistory, setChatHistory] = useState([]);

  // Add an effect to detect the user's system theme preference
  useEffect(() => {
    if (chatTheme === null) {
      const prefersDarkMode = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setChatTheme(prefersDarkMode ? "dark" : "light");
    }
    
    if (voiceTheme === null) {
      const prefersDarkMode = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setVoiceTheme(prefersDarkMode ? "dark" : "light");
    }
  }, []);

  // Initial delay for showing the box
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBox(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  // Dynamic text fetching logic
  useEffect(() => {
    async function fetchDynamicText() {
      if (!shouldFetch.current) return;

      try {
        const response = await axios.post(
          "http://localhost:5000/api/v0/leads-note",
          { campaign_id },
          { headers: { "Content-Type": "application/json" } }
        );

        if (!shouldFetch.current) return;

        setBubbleText(response.data.msg);
        setIsBubbleVisible(true);
        setDynamicText(response.data.msg);

        setTimeout(() => {
          if (shouldFetch.current) {
            setIsBubbleVisible(false);
          }
        }, 8000);
      } catch (error) {
        console.error("Failed to fetch dynamic text:", error);
        if (shouldFetch.current) {
          setBubbleText("");
          setDynamicText("");
        }
      }
    }

    // Modified to continue fetching even when chat is minimized
    const shouldStopFetching = isOpen || (modalType && modalType !== "chat");
    
    if (!shouldStopFetching) {
      shouldFetch.current = true;
      fetchDynamicText();
      fetchIntervalRef.current = setInterval(fetchDynamicText, 20000);
    } else {
      // Stop fetching in other modal states (except minimized chat)
      shouldFetch.current = false;
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      setIsBubbleVisible(false);
      setBubbleText("");
    }

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    };
  }, [isOpen, modalType]);

  useEffect(() => {
    const fetchCtaText = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v0/cta",
          { campaign_id },
          { headers: { "Content-Type": "application/json" } }
        );
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
    // Clear chat history only if we're fully closing the chat
    if (modalType === "chat") {
      setChatHistory([]);
    }
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

  return CommunicationModal({
    showBox,
    handleCloseBox,
    bubbleText,
    isBubbleVisible,
    handleButtonClick,
    isOpen,
    handleDialogClose,
    ctaText,
    modalType,
    handleModalClose,
    bookMeeting,
    setBookMeeting,
    setMeetingResponse,
    handleSelection,
    campaign_id,
    setChatTheme,
    chatTheme,
    voiceTheme, 
    setVoiceTheme,
    // Pass chat history for persistence
    chatHistory,
    setChatHistory
  });
}

export default FloatingButton;


// most recent working code 
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import CommunicationModal from "@/components/app/CommunicationModal";

// export function FloatingButton({ campaign_id }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showBox, setShowBox] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [dynamicText, setDynamicText] = useState("");
//   const [bubbleText, setBubbleText] = useState("");
//   const [isBubbleVisible, setIsBubbleVisible] = useState(false);
//   const [ctaText, setCtaText] = useState("");
//   const [bookMeeting, setBookMeeting] = useState(false);
//   const [meetingResponse, setMeetingResponse] = useState(null);
//   const fetchIntervalRef = useRef(null);
//   const shouldFetch = useRef(true);
//   const [chatTheme, setChatTheme] = useState(false);
//   const [voiceTheme, setVoiceTheme] = useState(false);



//     // Add an effect to detect the user's system theme preference
//     useEffect(() => {
//       if (chatTheme === null) {
//         const prefersDarkMode = window.matchMedia && 
//           window.matchMedia('(prefers-color-scheme: dark)').matches;
//         setChatTheme(prefersDarkMode ? "dark" : "light");
//       }
      
//       if (voiceTheme === null) {
//         const prefersDarkMode = window.matchMedia && 
//           window.matchMedia('(prefers-color-scheme: dark)').matches;
//         setVoiceTheme(prefersDarkMode ? "dark" : "light");
//       }
//     }, []);

//   // Initial delay for showing the box
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowBox(true);
//     }, 20000);

//     return () => clearTimeout(timer);
//   }, []);

//   // Dynamic text fetching logic
//   useEffect(() => {
//     async function fetchDynamicText() {
//       if (!shouldFetch.current) return;

//       try {
//         const response = await axios.post(
//           "http://localhost:5000/api/v0/leads-note",
//           { campaign_id },
//           { headers: { "Content-Type": "application/json" } }
//         );

//         if (!shouldFetch.current) return;

//         setBubbleText(response.data.msg);
//         setIsBubbleVisible(true);
//         setDynamicText(response.data.msg);

//         setTimeout(() => {
//           if (shouldFetch.current) {
//             setIsBubbleVisible(false);
//           }
//         }, 8000);
//       } catch (error) {
//         console.error("Failed to fetch dynamic text:", error);
//         if (shouldFetch.current) {
//           setBubbleText("");
//           setDynamicText("");
//         }
//       }
//     }

//     // Only fetch if we're not in a modal state
//     const shouldStartFetching = !isOpen && !modalType;

//     if (shouldStartFetching) {
//       shouldFetch.current = true;
//       fetchDynamicText();
//       fetchIntervalRef.current = setInterval(fetchDynamicText, 20000);
//     } else {
//       // Stop fetching in any modal state
//       shouldFetch.current = false;
//       if (fetchIntervalRef.current) {
//         clearInterval(fetchIntervalRef.current);
//         fetchIntervalRef.current = null;
//       }
//       setIsBubbleVisible(false);
//       setBubbleText("");
//     }

//     return () => {
//       if (fetchIntervalRef.current) {
//         clearInterval(fetchIntervalRef.current);
//         fetchIntervalRef.current = null;
//       }
//     };
//   }, [isOpen, modalType]); // Added modalType to dependencies

//   useEffect(() => {
//     const fetchCtaText = async () => {
//       try {
//         const response = await axios.post(
//           "http://localhost:5000/api/v0/cta",
//           { campaign_id },
//           { headers: { "Content-Type": "application/json" } }
//         );
//         setCtaText(response.data.data.call_to_action || "Book Appointment");
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

//   return CommunicationModal({
//     showBox,
//     handleCloseBox,
//     bubbleText,
//     isBubbleVisible,
//     handleButtonClick,
//     isOpen,
//     handleDialogClose,
//     ctaText,
//     modalType,
//     handleModalClose,
//     bookMeeting,
//     setBookMeeting,
//     setMeetingResponse,
//     handleSelection,
//     campaign_id,
//     setChatTheme,
//     chatTheme,
//     voiceTheme, 
//     setVoiceTheme
//   });
// }

// export default FloatingButton;
