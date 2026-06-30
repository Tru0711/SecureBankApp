import { useEffect, useState } from 'react';

export default function useAsyncData(fetchData, errorMessage) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    const res = await fetchData();
    setData(res.data);
  };

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.response?.data?.message || errorMessage))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, setError, refresh };
}
