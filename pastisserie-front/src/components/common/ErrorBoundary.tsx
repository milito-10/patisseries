import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-patisserie-cream p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-4 border-patisserie-red animate-fade-in-up">
                        <div className="text-6xl mb-4">🥐</div>
                        <h1 className="text-3xl font-serif text-patisserie-dark mb-4">¡Ups! Algo salió mal</h1>
                        <p className="text-gray-600 mb-6">
                            Parece que un pastelero se tropezó. Estamos trabajando para limpiar el desastre.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-patisserie-red text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                        >
                            Recargar la página
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full mt-4 text-gray-500 hover:text-patisserie-dark underline"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
