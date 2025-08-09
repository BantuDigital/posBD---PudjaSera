
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// axios.defaults.baseURL="https://api-mealikmu.bantudigital.org/api";
// const storageLink = "https://api-mealikmu.bantudigital.org/public";
axios.defaults.baseURL = "http://localhost:8000/api";
const storageLink = "http://localhost:8000/api";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

export default storageLink;
