import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  {
    id: 1,
    title: 'Support Orphanages Across India',
    description: 'Join a community dedicated to bringing hope and love to children in need.',
    image: 'https://images.unsplash.com/photo-1617878227827-8360231f7f03?auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'View Real-Time Needs',
    description: 'See exactly what each ashram needs—from food and clothes to education.',
    image: 'https://images.unsplash.com/photo-1623863568368-69e4cbe6cc0b?auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Donate or Visit',
    description: 'Make a difference by donating securely or scheduling a visit to share your love.',
    image: 'https://images.unsplash.com/photo-1599666882726-fe28581e3147?auto=format&fit=crop&q=80',
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col"
          >
            <div className="h-[60%] w-full relative">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover rounded-b-[40px]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 rounded-b-[40px]" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="text-2xl font-serif font-bold text-primary">
                {slides[currentSlide].title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pt-0 flex flex-col items-center space-y-6">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <Button onClick={handleNext} size="lg" className="w-full rounded-full text-lg h-14 shadow-lg">
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}