import { Link } from 'react-router-dom';

const a = () => {
    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="text-center p-5 shadow-lg rounded-4 bg-white" style={{ maxWidth: '500px' }}>
                <h1 className="display-1 fw-bold text-primary mb-0" style={{ fontSize: '120px', letterSpacing: '-5px' }}>
                    404
                </h1>
                <div className="mb-4">
                    <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>
                </div>

                <h2 className="fw-bold text-dark mb-3">Sahifa topilmadi!</h2>
                
                <p className="text-muted mb-4">
                    Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <Link to="/" className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm">
                        <i className="bi bi-house-door me-2"></i> Bosh sahifaga
                    </Link>
                    <button 
                        onClick={() => window.history.back()} 
                        className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
                    >
                        <i className="bi bi-arrow-left me-2"></i> Orqaga qaytish
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                    .display-1 {
                        animation: float 4s ease-in-out infinite;
                    }
                `}
            </style>
        </div>
    );
}

export default a;