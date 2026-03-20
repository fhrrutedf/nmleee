'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        
        const handleHoverStart = () => setIsHovering(true);
        const handleHoverEnd = () => setIsHovering(false);

        window.addEventListener('mousemove', updateMousePosition);
        
        // Add listeners to detect hovering over interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, .cursor-pointer');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleHoverStart);
            el.addEventListener('mouseleave', handleHoverEnd);
        });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverStart);
                el.removeEventListener('mouseleave', handleHoverEnd);
            });
        };
    }, []);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-action-blue pointer-events-none z-[100] mix-blend-difference hidden md:block"
                animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16, scale: isHovering ? 2 : 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-action-blue rounded-full pointer-events-none z-[100] hidden md:block"
                animate={{ x: mousePosition.x - 4, y: mousePosition.y - 4 }}
                transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
            />
        </>
    );
};
