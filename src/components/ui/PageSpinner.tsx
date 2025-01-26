"use client";

const PageSpinner = ({}: { title?: string }) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex justify-center items-center z-50">
      <div className="flex flex-col items-center gap-3 bg-black/10 px-8 py-6 rounded-2xl backdrop-blur-xl">
        {/* Animated bar spinner */}
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-8 bg-blue-500 rounded-full"
              style={{
                animation: "pulse 1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
                transformOrigin: "center center",
              }}
            />
          ))}
        </div>

        {/* Text */}
        {/* <span className="text-white/90 text-sm font-medium tracking-wide">
          {title ?? "جاري التحميل"}
        </span> */}

        {/* Animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              transform: scaleY(0.5);
              opacity: 0.5;
            }
            50% {
              transform: scaleY(1.3);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PageSpinner;
