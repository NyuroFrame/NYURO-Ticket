import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => res.json())
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { tickets, loading, error };
}
