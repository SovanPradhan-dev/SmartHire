import axios from "axios";
import { useState, useEffect } from "react";

const Testing = () => {
  const [ques, setQues] = useState([]);
  useEffect(() => {
    const fetchData =()=>{
    axios.get("http://localhost:3000/inter/getques").then((res) => {
      setQues(res.data.question);
      console.log(res);
    })}
    fetchData()
  }, []);
  return (
  <div>
    {ques.length> 0 ? <h2>{ques[1]}</h2> : Loading}
  </div>
  )
};

export default Testing;
