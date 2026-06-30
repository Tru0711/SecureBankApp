import { useState } from 'react';

export default function useFormState(initialState) {
  const [form, setForm] = useState(initialState);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const reset = () => setForm(initialState);

  return { form, setForm, change, reset };
}
