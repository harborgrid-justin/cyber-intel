
import { useReducer, useCallback } from 'react';

type FormState<T> = {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
};

type Action<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: any }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'START_SUBMIT' }
  | { type: 'END_SUBMIT' }
  | { type: 'RESET'; payload: T };

function formReducer<T>(state: FormState<T>, action: Action<T>): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case 'SET_TOUCHED':
      return { ...state, touched: { ...state.touched, [action.field]: true } };
    case 'START_SUBMIT':
      return { ...state, isSubmitting: true };
    case 'END_SUBMIT':
      return { ...state, isSubmitting: false };
    case 'RESET':
      return { values: action.payload, errors: {} as any, touched: {} as any, isSubmitting: false };
    default:
      return state;
  }
}

export function useFormReducer<T>(initialValues: T) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {} as any,
    touched: {} as any,
    isSubmitting: false
  });

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value } as Action<T>);
    dispatch({ type: 'SET_TOUCHED', field } as Action<T>);
  }, []);

  return { state, dispatch, setFieldValue };
}
