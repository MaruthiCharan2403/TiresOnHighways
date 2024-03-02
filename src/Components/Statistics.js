import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';

export default function Statistics(props) {
  props.setSignInButton(true);
  const [stats, setStats] = useState([]);

  async function getStats() {

    try {
      const response = await axios.get(`https://tohexpress.onrender.com/stats`);
      setStats(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getStats();
  }, []);
  const data = [
    ["Condition", "Number of cases"],
    ["Cracked", stats[0]],
    ["Normal", stats[1]],
  ];

  const options = {
    title: "Analysis of Tires",
    is3D: true,
  };

  return (
    <div className='parenth mt-5'>
    <div className='container shadow-lg border border-white border-3 p-4 rounded-4 bg-black'>
      <Chart className=''
        chartType="PieChart"
        data={data}
        options={options}
        width={"100%"}
        height={"400px"}
      />
    </div>
    </div>
  );
}