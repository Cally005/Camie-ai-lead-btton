import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XIcon, MessageCircleIcon, MicIcon, CalendarIcon } from "lucide-react";
import { BubbleText } from "./BubbleText";
import { ChatInterface } from "./ChatInterface";
import { VoiceInterface } from "./Voiceinterface";
import Modal from "./MeetingModal";

const CommunicationModal = ({
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
}) => {
  const CommunicationOption = ({ icon: Icon, title, description, onClick }) => (
    <div
      onClick={onClick}
      className="p-4 bg-gray-100 rounded-lg shadow-md hover:bg-primary/10 transition-all cursor-pointer dark:bg-gray-800 flex flex-col items-center justify-center gap-3 h-full"
    >
      <Icon className="h-8 w-8 text-primary" />
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
        {description}
      </p>
    </div>
  );

  return (
    <>
      {/* Notification Box */}
      {showBox && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 max-w-[90vw] sm:max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-3 relative">
            <button
              onClick={handleCloseBox}
              className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-md transition-colors"
            >
              <XIcon className="h-4 w-4 text-gray-600" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src="/src/assets/love.gif"
                  alt="Love animation"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-800 mb-2">
                  Hey! Wanna know more about me?
                </p>
                <button
                  onClick={handleButtonClick}
                  className="w-full bg-primary text-white py-1.5 px-3 rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
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
              loading="lazy"
            />
          </button>
        </div>
      </div>

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex flex-col items-center justify-between gap-4 md:gap-8 rounded-lg shadow-xl bg-white w-[95vw] md:w-[80vw] h-[90vh] md:h-[80vh] max-w-[1000px] p-4 md:p-6 overflow-y-auto dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl sm:text-2xl font-semibold text-center">
            How do you want us to communicate?
          </h2>

          <div className="w-full max-w-[200px] aspect-square">
            <img
              src="/src/assets/love.gif"
              alt="Love animation"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <div
            className={`grid sm:grid-cols-3 md:grid-cols-${
              ctaText === "Book Appointment" ? "3" : "2"
            } gap-4 w-full mt-4`}
          >
            <CommunicationOption
              icon={MessageCircleIcon}
              title="Chat with Me"
              description="Text-based communication for quick exchanges."
              onClick={() => handleSelection("chat")}
            />

            <CommunicationOption
              icon={MicIcon}
              title="Talk with Audio"
              description="Voice-based interaction for more personal conversations."
              onClick={() => handleSelection("voice")}
            />

            {ctaText === "Book Appointment" && (
              <CommunicationOption
                icon={CalendarIcon}
                title={ctaText}
                description="Schedule a time that works best for you."
                onClick={() => handleSelection("appointment")}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Content Based on Type */}
      {modalType && (
        <Dialog open={true} onOpenChange={handleModalClose}>
          <DialogContent className="flex items-center justify-center rounded-lg w-[95vw] md:w-[40vw] h-[90vh] max-w-[1200px] dark:bg-gray-900 dark:text-white">
            {modalType === "chat" && (
              <ChatInterface
                handleModalClose={handleModalClose}
                campaign_id={campaign_id}
              />
            )}
            {modalType === "voice" && (
              <VoiceInterface campaign_id={campaign_id} />
            )}
            {modalType === "appointment" && (
              <Modal
                isOpen={bookMeeting}
                setOpen={setBookMeeting}
                className="w-full h-full"
                setMeeting={setMeetingResponse}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CommunicationModal;
