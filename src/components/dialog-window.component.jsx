import { useEffect, useState } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const DialogWrapper = ({
  children,
  onConfirm,
  message,
  confirmText,
  cancelText
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const triggerWithClick = () => {
    return typeof children === "function"
      ? children({ open: handleTriggerClick })
      : React.cloneElement(children, {
        onClick: handleTriggerClick,
      });
  };

  const handleConfirm = () => {
    onConfirm?.();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <>
      {triggerWithClick()}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-auto bg-black-404/40 flex items-center justify-center"
            style={{ backdropFilter: "blur(4px)" }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            onClick={handleCancel}
          >
            <motion.div
              className="bg-white border-grey shadow-md border-2 p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4">
                {message ? message : <p>{t("Are you sure you want to do this?")}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-grey">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-grey text-black hover:bg-black hover:text-white"
                >
                  {cancelText ? cancelText : t("Cancel")}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-royalblue text-white-404 hover:bg-black hover:text-white"
                >
                  {confirmText ? confirmText : t("Confirm")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DialogWrapper;
