import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { credentialHeaders } from '~/services/credentials';
import { toast } from "react-hot-toast";
import { UserContext } from "../App";

const ReportDialog = ({ postId, children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userAuth: { access_token } } = useContext(UserContext);

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

  const handleOpen = (e) => {
    e?.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setReportText("");
  };

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      toast.error(t("Please enter report reason"));
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/report-post`, {
        post_id: postId,
        report_text: reportText
      }, {
        headers: {
          'X-Authorization': `Bearer ${access_token}`,
          ...credentialHeaders
        }
      });

      toast.success(t("Report submitted successfully"));
      handleClose();
    } catch (error) {
      toast.error(t("You have already sent a complaint."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {typeof children === "function"
        ? children({ open: handleOpen })
        : React.cloneElement(children, { onClick: handleOpen })
      }

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black-404/40 backdrop-blur-sm flex items-center justify-center"
            onClick={handleClose}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="bg-white border-grey shadow-md border-2 p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-2xl mb-4">{t("Report this post")}</p>

              <div className="mb-4 relative">
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder={t("Please describe the issue")}
                  className="input-box w-full p-2 border-3 border-grey resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="absolute -top-7 right-0 text-xs text-dark-grey/70">
                  {reportText.length}/500
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-grey">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-grey text-black hover:bg-black hover:text-white disabled:opacity-40"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-royalblue text-white-404 hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {t("Submit Report")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportDialog;
