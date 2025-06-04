import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UserContext } from "../App";
import Loader from "../components/loader.component";
import { credentialHeaders } from '~/services/credentials'
import { useTranslation } from "react-i18next";

const UserStatisticsPage = () => {
  const { t } = useTranslation();

  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_posts: 0,
    total_comments: 0,
    total_likes: 0,
    total_reads: 0
  });

  const statItems = [
    { id: "total_posts", label: t("total_posts"), value: stats.total_posts },
    { id: "total_comments", label: t("total_comments"), value: stats.total_comments },
    { id: "total_likes", label: t("total_likes"), value: stats.total_likes },
    { id: "total_reads", label: t("total_reads"), value: stats.total_reads }
  ];


  const { userAuth: { access_token } } = useContext(UserContext);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white border border-grey p-2 text-sm text-black drop-shadow-sm">
        <p>{label}</p>
        {payload.map((entry, idx) => {
          let textColor = "text-red";
          if (entry.dataKey === "comments") {
            textColor = "text-royalblue";
          }

          return (
            <p key={idx} className={textColor}>
              {entry.name}: {entry.value}
            </p>
          );
        })}
      </div>
    );
  };


  const fetchData = () => {
    setLoading(true);
    axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/get-user-statistics`,
      { days },
      {
        headers: {
          'X-Authorization': `Bearer ${access_token}`,
          ...credentialHeaders
        }
      }
    )
      .then(response => {
        const res = response.data;
        const now = new Date();
        const dateMap = {};

        for (let i = 0; i <= days; i++) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          dateMap[dateStr] = { date: dateStr, posts: 0, comments: 0 };
        }

        res.recentPosts.forEach(post => {
          const dateStr = new Date(post.publishedAt).toISOString().split("T")[0];
          if (dateMap[dateStr]) dateMap[dateStr].posts += 1;
        });

        res.commentDates.forEach(comment => {
          const dateStr = new Date(comment.commentedAt).toISOString().split("T")[0];
          if (dateMap[dateStr]) dateMap[dateStr].comments += 1;
        });

        setData(Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)));
        setStats(res.totalStats);

      })
      .catch(err => {
        console.error(`${t("An error occured")}: `, err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!access_token) return;
    fetchData();
  }, [days, access_token]);

  return (
    <>
      <h1 className="max-md:hidden text-xl">{t("Your Activity")}</h1>
      <div className="p-4">

        <label className="mb-4 flex items-center">
          {t("Period")} ({t("days")}):
          <select className="text-black bg-white outline-none" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value="7">7</option>
            <option value="14">14</option>
            <option className="max-sm:hidden" value="30">30</option>
            <option className="max-sm:hidden" value="180">180</option>
            <option className="max-sm:hidden" value="365">365</option>
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

        {/* Graph */}
        {loading ? <Loader /> : (
          <ResponsiveContainer width="110%" height={400} className="text-black -ml-8">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="posts" name={t("Posts")} stroke="red" />
              <Line type="monotone" dataKey="comments" name={t("Comments")} stroke="royalblue" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Stats Summary */}
        <div className="flex gap-2 max-lg:pb-6 border-grey mt-4 max-lg:border-b">
          {statItems.map(({ id, label, value }, i) => (
            <div
              key={id}
              className={
                "flex flex-col items-center w-full h-full justify-center p-4 max-sm:px-2 px-6 " +
                (i !== 0 ? "border-grey border-l" : "")
              }
            >
              <h1 className="text-xl lg:text-2xl mb-2">{value.toLocaleString()}</h1>
              <p className="max-lg:text-dark-grey capitalize text-center">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserStatisticsPage;
