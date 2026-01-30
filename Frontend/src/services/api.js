import axios from "axios";

export const matchCVJD = (formData) =>
  axios.post("http://localhost:5000/match", formData);
