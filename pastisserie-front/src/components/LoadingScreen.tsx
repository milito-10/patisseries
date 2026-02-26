import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-patisserie-cream z-[9999] flex flex-col items-center justify-center animate-fade-in">
            {/* Elegant Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-patisserie-red/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-patisserie-red/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative flex flex-col items-center">

                {/* Spinners */}
                <div className="flex items-center justify-center h-24 w-24">
                    <div className="w-24 h-24 rounded-full border-[2px] border-patisserie-red/20 border-t-patisserie-red animate-spin"></div>
                    <div className="absolute w-20 h-20 rounded-full border-[2px] border-transparent border-b-patisserie-dark/20 animate-spin-slow"></div>
                </div>

                <div className="mt-12 text-center z-10">
                    <h2 className="text-patisserie-dark font-serif text-3xl font-bold tracking-[0.2em] uppercase mb-1">
                        Pâtisserie <span className="text-patisserie-red font-light italic">Deluxe</span>
                    </h2>

                    <div className="flex items-center justify-center space-x-4 my-6">
                        <div className="h-[1px] w-12 bg-patisserie-red/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-patisserie-red animate-pulse"></div>
                        <div className="h-[1px] w-12 bg-patisserie-red/40"></div>
                    </div>

                    <p className="text-patisserie-dark/40 font-sans text-xs uppercase tracking-[0.4em] animate-pulse">
                        Preparando algo <span className="italic font-serif">especial</span>
                    </p>
                </div>
            </div>

            {/* Progress bar simulation */}
            <div className="absolute bottom-20 w-48 h-[2px] bg-gray-100 overflow-hidden rounded-full">
                <div className="h-full bg-patisserie-red animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(248,85,85,0.4), transparent)' }}></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
