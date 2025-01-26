import { itemVariants } from "@/components/animations/varients";
import { motion } from "framer-motion";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { FC, useState } from "react";
import { FieldError, UseFormRegister } from "react-hook-form";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: FieldError;
  name: string;
}

export const CustomInput: FC<CustomInputProps> = ({
  label,
  icon: Icon,
  register,
  error,
  name,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <label className="block text-gray-200 text-right text-sm">{label}</label>
      <div className="relative group">
        <input
          className={`w-full p-2.5 sm:p-3 bg-black/50 border ${
            error ? "border-red-500" : "border-gray-700"
          } rounded-lg sm:rounded-xl pr-10 text-right text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/60 hover:border-orange-500/40 transition-all text-sm sm:text-base ${
            isPassword ? "pl-10" : ""
          }`}
          dir="rtl"
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...register(name)}
          {...props}
        />
        {/* Password Toggle Button */}
        {isPassword ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-3 sm:top-3.5 p-0.5 rounded-md hover:bg-gray-800/50 transition-colors"
          >
            {showPassword ? (
              <EyeOff
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Hide password"
              />
            ) : (
              <Eye
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Show password"
              />
            )}
          </motion.button>
        ) : (
          <Icon
            className={`absolute left-3 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 ${
              error
                ? "text-red-400"
                : "text-gray-400 group-hover:text-orange-400"
            } transition-colors ${isPassword ? "left-10" : ""}`}
          />
        )}
      </div>

      {error && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 block mt-1"
        >
          {error.message}
        </motion.span>
      )}
    </motion.div>
  );
};
