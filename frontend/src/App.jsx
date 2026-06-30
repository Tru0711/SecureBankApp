import { Navigate, Route, Routes } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from './store/authSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return <AppRouter />;
}