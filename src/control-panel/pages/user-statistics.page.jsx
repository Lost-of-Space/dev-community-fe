import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { UserContext } from "../../App";
import Loader from "../../components/loader.component";
import { useTranslation } from "react-i18next";

import { credentialHeaders } from '~/services/credentials';

const StatisticsPage = () => {
  const { t } = useTranslation();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white border border-grey p-2 text-sm text-black drop-shadow-sm">
        <p>{label}</p>
        <p className="text-royalblue">{t("Users")}: {payload[0].value}</p>
      </div>
    );
  };

  const [days, setDays] = useState(14);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { id: "total_users", value: 0 },
    { id: "users_last_days", value: 0 },
    { id: "total_blocked", value: 0 }
  ]);


  let { userAuth: { access_token, isAdmin } } = useContext(UserContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-user-stats`,
        {
          days,
          isAdmin,
        },
        {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          }
        }
      );

      const now = new Date();
      const counts = {};

      res.recentUsers.forEach(user => {
        const date = new Date(user.joinedAt).toISOString().split("T")[0];
        counts[date] = (counts[date] || 0) + 1;
      });

      const graphData = [];
      for (let i = 0; i <= days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        graphData.unshift({ date: dateStr, count: counts[dateStr] || 0 });
      }

      setData(graphData);
      setStats([
        { id: "total_users", value: res.totalUsers },
        { id: "users_last_days", value: res.recentUsers.length },
        { id: "total_blocked", value: res.blockedUsers }
      ]);


    } catch (err) {
      console.error(`${t("An error occured")}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  return (
    <div>
      <h1 className="text-xl mb-4">{t("Users Registered")}</h1>
      <label className="mb-4 flex items-center max-md:mt-5 md:mt-8">
        {t("Period")} ({t("days")}):
        <select className="text-black bg-white outline-none" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value="7">7</option>
          <option value="14">14</option>
          <option value="30" className="max-sm:hidden">30</option>
          <option value="180" className="max-sm:hidden">180</option>
          <option value="365" className="max-sm:hidden">365</option>
        </select>
        <div className="flex flex-wrap ml-4 gap-2 max-sm:hidden">
          {[7, 14, 30, 180, 365].map(option => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={`btn-filter px-2 py-1 ${days === option ? 'bg-black text-white' : 'bg-grey text-black'}`}
            >
              {option === 14 ? t("2 Weeks") : option === 30 ? t("1 Month") : option === 180 ? t("Half a Year") : option === 365 ? t("1 Year") : `${option} ${t("Days")}`}
            </button>
          ))}
        </div>
      </label>

      {loading ? (
        <Loader />
      ) : (
        <ResponsiveContainer width="100%" className="text-black max-sm:-ml-10" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip content={CustomTooltip} />
            <Line type="monotone" dataKey="count" stroke="royalblue" />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-2 max-lg:pb-6 mt-4 border-grey max-lg:border-b">
        {stats.map(({ id, value }, i) => (
          <div
            key={id}
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6 max-sm:px-2 " +
              (i !== 0 ? "border-grey border-l" : "")
            }
          >
            <h1 className="text-xl lg:text-2xl mb-2">{t(value.toLocaleString())}</h1>
            <p className="max-lg:text-dark-grey max-sm:text-sm capitalize text-center">
              {id === t("users_last_days") ? t(id, { days }) : t(id)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsPage;
