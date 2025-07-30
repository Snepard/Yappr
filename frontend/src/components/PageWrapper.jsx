import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1,},
  },
  exit: { opacity: 0, y: 50, transition: {duration: 0.4, ease: [0.42, 0, 0.58, 1],},},
};

export default function PageWrapper({ children }) {
  return (
    <motion.div
      className="min-h-screen" // or bg-black etc.
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}