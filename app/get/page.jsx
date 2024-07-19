'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getFilePage = () => {
  const router = useRouter();
  const [serverInfo, setServerInfo] = useState({ ip: '', port: '' });
  const [filePercentage, setFilePercentage] = useState('Awaiting file transfer...');

  useEffect(() => {
    const fetchServerInfo = async () => {
      const res = await fetch('/api/server-info');
      const data = await res.json();
      setServerInfo(data);
    };

    fetchServerInfo();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch('/api/upload');
      const data = await res.json();
      const percentage = Number(data.percentage);
      if (percentage > 0 && percentage < 100) {
        setFilePercentage(percentage + '%');
      } else if (percentage === 100) {
        setFilePercentage('File transfer complete!');
        setTimeout(() => {
          setFilePercentage('Awaiting file transfer...');
        }, 5000);
      }
    };

    setInterval(fetchStatus, 1000);
  }, []);

  return (
    <div>
      <button
        className="flex items-center mb-4 font-semibold text-gray-300"
        onClick={() => router.back()}
      >
        ← Back
      </button>
      <div className='font-semibold text-gray-800'>Server IP: {serverInfo.ip}</div>
      <div className='font-semibold text-gray-800'>Server Port: {serverInfo.port}</div>
      <div className='font-bold text-gray-800 mt-5'>
        {filePercentage}
      </div>
    </div>
  );
};

export default getFilePage;
