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

export { BubbleText };
