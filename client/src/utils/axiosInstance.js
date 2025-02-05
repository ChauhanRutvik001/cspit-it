import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3100/api/v1',
  withCredentials: true,
});

export default axiosInstance;


// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://192.168.24.235:3100/api/v1', // Ensure this URL is correct
//   withCredentials: true,
// });

// export default axiosInstance;