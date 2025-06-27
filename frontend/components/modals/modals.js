"use client"
import { AnimatePresence, motion } from "framer-motion"
import { FiAlertCircle, FiX, FiCheck, FiInfo, FiHelpCircle } from "react-icons/fi"
import { useState } from "react"

const Modal = ({
  isOpen,
  onClose,
  title = "One more thing!",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Id aperiam vitae, sapiente ducimus eveniet in velit.",
  type = "info",
  primaryButtonText = "Understood!",
  secondaryButtonText = "Go back",
  onPrimaryAction,
  onSecondaryAction,
  showCloseButton = true,
  noButtons = false,
}) => {
  // Determine icon and styles based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <FiCheck className="text-green-600" />,
          bg: "from-green-500 to-emerald-600",
          iconBg: "bg-white"
        }
      case "warning":
        return {
          icon: <FiAlertCircle className="text-yellow-600" />,
          bg: "from-amber-500 to-yellow-600",
          iconBg: "bg-white"
        }
      case "error":
        return {
          icon: <FiX className="text-red-600" />,
          bg: "from-red-500 to-rose-600",
          iconBg: "bg-white"
        }
      case "question":
        return {
          icon: <FiHelpCircle className="text-indigo-600" />,
          bg: "from-indigo-500 to-violet-600",
          iconBg: "bg-white"
        }
      default: // info
        return {
          icon: <FiInfo className="text-blue-600" />,
          bg: "from-blue-500 to-indigo-600",
          iconBg: "bg-white"
        }
    }
  }

  const { icon, bg, iconBg } = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="bg-slate-900/20 backdrop-blur p-4 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-gradient-to-br ${bg} text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden`}
          >
            {/* Background decorative icon */}
            <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            
            <div className="relative z-10">
              {/* Header with icon */}
              <div className={`${iconBg} w-16 h-16 mb-4 rounded-full text-3xl grid place-items-center mx-auto`}>
                {icon}
              </div>
              
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              )}

              {/* Content */}
              <h3 className="text-3xl font-bold text-center mb-2">{title}</h3>
              <p className="text-center mb-6 text-white/90">{description}</p>

              {/* Buttons */}
              {!noButtons && (
                <div className="flex gap-3">
                  {onSecondaryAction && (
                    <button
                      onClick={onSecondaryAction}
                      className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                    >
                      {secondaryButtonText}
                    </button>
                  )}
                  <button
                    onClick={onPrimaryAction || onClose}
                    className="bg-white hover:opacity-90 transition-opacity text-black font-semibold w-full py-2 rounded"
                  >
                    {primaryButtonText}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Example Usage
const ExampleWrapper = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState("info")

  const handleConfirm = () => {
    alert("Action confirmed!")
    setIsOpen(false)
  }

  return (
    <div className="px-4 py-64 bg-slate-900 grid place-content-center space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => {
            setModalType("info")
            setIsOpen(true)
          }}
          className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Info Modal
        </button>
        <button
          onClick={() => {
            setModalType("success")
            setIsOpen(true)
          }}
          className="bg-green-600 text-white font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Success Modal
        </button>
        <button
          onClick={() => {
            setModalType("error")
            setIsOpen(true)
          }}
          className="bg-red-600 text-white font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Error Modal
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalType === "success" ? "Success!" : modalType === "error" ? "Error!" : "Notice"}
        description={
          modalType === "success" 
            ? "Your action was completed successfully!" 
            : modalType === "error"
            ? "Something went wrong. Please try again."
            : "This is an important information message."
        }
        type={modalType}
        primaryButtonText="Confirm"
        secondaryButtonText="Cancel"
        onPrimaryAction={handleConfirm}
      />
    </div>
  )
}

{/* <Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Custom Title"
  description="Custom description text here"
  type="success" // or "info", "warning", "error", "question"
  primaryButtonText="Okay"
  secondaryButtonText="Not now"
  onPrimaryAction={customFunction}
  showCloseButton={false}
  noButtons={false}
/> */}
export { Modal, ExampleWrapper }