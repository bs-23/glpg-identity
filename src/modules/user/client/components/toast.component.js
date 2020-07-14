import { ToastProvider } from 'react-toast-notifications';
export const Toast = ({ appearance, children }) => (


    <div className={{ background: appearance === 'error' ? 'bg-danger' : 'bg-success' }}>
        {children}
    </div>
);