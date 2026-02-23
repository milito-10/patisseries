import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative flex items-center justify-center">
                {/* Outer Ring - Red */}
                <div className="w-32 h-32 rounded-full border-[3px] border-patisserie-red/10 border-t-patisserie-red animate-spin"></div>

                {/* Inner Ring - Charcoal - Counter-rotate */}
                <div className="absolute w-24 h-24 rounded-full border-[2px] border-transparent border-b-patisserie-dark/40 animate-spin-slow"></div>

                {/* Center Dot */}
                <div className="absolute w-2 h-2 bg-patisserie-red rounded-full animate-pulse shadow-[0_0_15px_rgba(248,85,85,0.8)]"></div>
            </div>

            <div className="mt-12 text-center">
                <h2 className="text-patisserie-dark font-serif text-2xl font-medium tracking-[0.4em] uppercase mb-2">
                    Patisserie <span className="text-patisserie-red italic">Deluxe</span>
                </h2>
                <div className="h-[1px] w-24 bg-patisserie-red/30 mx-auto my-4"></div>
                <p className="text-patisserie-dark/50 font-medium text-[10px] uppercase tracking-[0.5em] animate-pulse">
                    Cocinando <span className="italic">Experiencias</span>
                </p>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-patisserie-red/5 rounded-full blur-[100px] -z-10"></div>
        </div>
    );
};

export default LoadingScreen;
