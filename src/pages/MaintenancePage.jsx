import React from 'react';
import { useLocation } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { motion } from 'framer-motion';

const MaintenancePage = () => {
  const location = useLocation();
  const message = location.state?.message || 'Estamos realizando uma manutenção programada e voltaremos em breve. Agradecemos a sua paciência!';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="mb-8"
      >
        <HardHat className="w-24 h-24 text-yellow-400" />
      </motion.div>
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold mb-4"
      >
        Em Manutenção
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default MaintenancePage;