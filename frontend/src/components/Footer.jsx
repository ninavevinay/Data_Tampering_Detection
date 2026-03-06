import { motion } from "framer-motion";

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="w-full bg-slate-950 px-6 py-4 text-center text-sm font-medium text-slate-300 dark:bg-black dark:text-slate-400"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4 lg:gap-6 text-xs sm:text-sm">
        <span className="font-semibold text-white">A Data Tampering Detection System Using Hash Comparison</span>
        <span className="hidden text-slate-600 sm:inline">|</span>
        <span>Group No: A5</span>
        <span className="hidden text-slate-600 sm:inline">|</span>
        <span>Developed by: Vinay Ninave (CS23022) & Piyush Lomte (CS23033)</span>
      </div>
    </motion.footer>
  );
}

