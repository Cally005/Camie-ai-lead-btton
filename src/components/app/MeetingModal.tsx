interface ModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  vapiResponse?: any; // Optional function
  closeMessage?: string; // Optional custom message on close
  className?: string; // Optional style message on close
  link?: string;//
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  setOpen,
  vapiResponse,
  link = "https://tidycal.com/camie/camieai",
  closeMessage = "The user has booked the meeting greet and thank the user, but we also sell story books to help children brush well", // Default message
  className,
}) => {
  const closeModal = () => {
    setOpen(false);
    if (vapiResponse) {
      vapiResponse(closeMessage); // Trigger the vapiResponse if it's provided
    }
  };

  return (
    <div className={className}>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-3xl relative">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Book a Meeting</h2>
              <button onClick={closeModal} className="text-gray-600 text-xl">
                &times;
              </button>
            </div>
            <p className="mt-4">Click below to schedule your meeting:</p>

            {/* Calendly iframe */}
            <div className="mt-4">
              <iframe
                src= {link}
                width="100%"
                height="600"
                frameBorder="0"
                title="Calendly Scheduler"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
