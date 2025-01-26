import { itemVariants } from "@/components/animations/varients";
import { motion, HTMLMotionProps } from "framer-motion";
import { FC } from "react";

interface GradientButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const GradientButton: FC<GradientButtonProps> = ({
  children,
  isLoading,
  ...props
}) => (
  <motion.button
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={isLoading}
    className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl font-semibold relative overflow-hidden group text-sm sm:text-base disabled:opacity-70 shadow-lg shadow-orange-500/10"
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-500/20" />
    <span className="relative text-white flex items-center justify-center gap-2">
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          جاري تسجيل الدخول...
        </>
      ) : (
        children
      )}
    </span>
  </motion.button>
);
