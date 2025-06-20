import { useState } from "react"
import { motion } from "motion/react"
import Backdrop from "../common/Backdrop"
import { API_ENDPOINTS, apiRequest } from "../../config/api"
import { IoMdCloseCircle } from "react-icons/io"
import toast from "react-hot-toast"
import LoadingCircleSpinner from "../ui/LoadingCircleSpinner"

const dropIn = {
    initial: {
        y: -100,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1
    },
    exit: {
        y: 100,
        opacity: 0
    }
}

const GrantAdminModal = ({ onClose }) => {
    const [email, setEmail] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handleGrantAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsProcessing(true)
            await apiRequest(API_ENDPOINTS.admin.giveAdminRights, {
                method: "PATCH",
                body: `"${email}"`
            })
            toast.success(`Administrator rights successfully granted to the user with email ${email}`)
            onClose()
        } catch (error) {
            console.error("Granting admin rights failed:", error)
            toast.error("Failed to grant administrator rights to the user.")
        }
        finally {
            await new Promise(r => setTimeout(r, 2000));
            setIsProcessing(false)
        }
    }

    return (
        <Backdrop onClose={onClose}>
            <motion.div
                className="bg-white rounded-xl p-6 relative w-[400px]"
                variants={dropIn}
                initial="initial"
                animate="visible"
                exit="exit"
                drag
                transition={{
                    y: { type: "spring", bounce: 0 }
                }}
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    <IoMdCloseCircle className="w-7 h-7" />
                </button>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Grant admin rights
                </h2>
                <p className="text-gray-600">
                    Provide an email address of the user you want to grant administrartor rights to
                </p>
                <form onSubmit={handleGrantAdminSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        className="border px-3 py-2 rounded w-full"
                    />
                    {isProcessing ? (
                        <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition w-full inline-flex items-center justify-center" disabled>
                            <LoadingCircleSpinner />
                            Processing...
                        </button>)
                        : (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="submit"
                                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                                >
                                    Grant
                                </button>
                                <button
                                    type="button"
                                    className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>)
                    }
                </form>
            </motion.div>
        </Backdrop>
    )

}

export default GrantAdminModal