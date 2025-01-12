import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CommunicationModal from "@/components/app/CommunicationModal";

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
  const fetchIntervalRef = useRef(null);
  const shouldFetch = useRef(true);

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
          "https://camie-ai.onrender.com/api/v0/ai/leads-note",
          { campaign_id: "29e4fed1-de1b-474e-8e0e-a3bbd21a7d76" },
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

    // Only fetch if we're not in a modal state
    const shouldStartFetching = !isOpen && !modalType;

    if (shouldStartFetching) {
      shouldFetch.current = true;
      fetchDynamicText();
      fetchIntervalRef.current = setInterval(fetchDynamicText, 20000);
    } else {
      // Stop fetching in any modal state
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
  }, [isOpen, modalType]); // Added modalType to dependencies

  useEffect(() => {
    const fetchCtaText = async () => {
      try {
        const response = await axios.post(
          "https://camie-ai.onrender.com/api/v0/ai/call-to-action",
          { campaign_id: "29e4fed1-de1b-474e-8e0e-a3bbd21a7d76" },
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
  });
}

export default FloatingButton;
