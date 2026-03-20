'use client';

import { motion } from 'framer-motion';

interface RevealTextProps {
    text: string;
    className?: string;
    delay?: number;
}

export const RevealText = ({ text, className, delay = 0 }: RevealTextProps) => {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: delay * 0.1 },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            transition: { type: "spring", damping: 12, stiffness: 100 },
        },
        hidden: {
            opacity: 0,
            y: 50,
            rotateZ: 10,
        },
    };

    return (
        <motion.div 
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "inherit" }} 
            className={`gap-x-4 gap-y-2 ${className || ''}`} 
            variants={container} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
        >
            {words.map((word, index) => (
                <motion.span variants={child} style={{ display: "inline-block" }} key={index}>
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};
