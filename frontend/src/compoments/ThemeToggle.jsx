import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <motion.button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 p-0.5 transition-colors"
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white dark:bg-sc-orange flex items-center justify-center shadow-md"
        animate={{ x: dark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {dark ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-amber-500" />}
      </motion.div>
    </motion.button>
  )
}
