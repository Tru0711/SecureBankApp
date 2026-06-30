import { useEffect, useState } from 'react';

export default function useAsyncItems(fetchItems, errorMessage) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetchItems();
    setItems(res.data.items || []);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.response?.data?.message || errorMessage))
      .finally(() => setLoading(false));
  }, []);

  return { items, setItems, loading, error, setError, load };
}
