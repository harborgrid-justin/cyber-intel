
import { View } from '../types';

export const useNavigate = () => {
  const navigate = (view: View, params?: any) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { 
      detail: { view, ...params } 
    }));
  };

  return navigate;
};
