import { useRef, useEffect } from 'react';

const useCardHoverEffect = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      
      const rotateX = (y - height / 2) / (height / 2) * -5; // Intensidade do efeito
      const rotateY = (x - width / 2) / (width / 2) * 5;  // Intensidade do efeito

      card.style.setProperty('--rotateX', `${rotateX}deg`);
      card.style.setProperty('--rotateY', `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--rotateX', '0deg');
      card.style.setProperty('--rotateY', '0deg');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return cardRef;
};

export default useCardHoverEffect;