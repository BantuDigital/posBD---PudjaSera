
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import 'rsuite/dist/rsuite.min.css';

// axios.defaults.baseURL="https://api-pujasera.bantudigital.org/api";
// const storageLink = "https://api-pujasera.bantudigital.org/public/";
axios.defaults.baseURL = "http://localhost:8000/api";
const storageLink = "";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

export default storageLink;
