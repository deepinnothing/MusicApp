import { useEffect } from "react"
import { motion } from "motion/react"

const Backdrop = ({ children, onClose }) => {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        };

        document.addEventListener("keydown", handleEsc)

        // Cleanup the event listener on component unmount
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    return (
        <motion.div
            id="backdrop"
            className="bg-black/70 backdrop-blur-xs fixed left-0 top-0 w-full h-full flex justify-center items-center z-50"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {children}
        </motion.div>
    )
};

export default Backdrop