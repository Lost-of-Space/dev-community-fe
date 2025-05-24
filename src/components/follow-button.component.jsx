import { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../App";
import { credentialHeaders } from '~/services/credentials';
import { useTranslation } from "react-i18next";

const FollowButton = ({ username }) => {
  const { t } = useTranslation();

  const [isFollowed, setIsFollowed] = useState(false);
  let { userAuth: { access_token } } = useContext(UserContext)

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${import.meta.env.VITE_SERVER_DOMAIN}/follow-status/${username}`, {
          headers: {
            'X-Authorization': `Bearer ${access_token}`,
            ...credentialHeaders
          },
        })
        .then(({ data }) => setIsFollowed(data.isFollowing))
        .catch(err => console.log(err));
    }
  }, [username, access_token]);

  const handleFollow = () => {
    if (!access_token) return toast.error(t("Sign in to follow"));

    const newState = !isFollowed;
    setIsFollowed(newState);

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/follow-user`,
      { username, isFollowed },
      {
        headers: {
          'X-Authorization': `Bearer ${access_token}`,
          ...credentialHeaders
        }
      }
    )
      .then(({ data }) => {
        console.log(data);
      })
      .catch(err => {
        setIsFollowed(!newState);
        console.log(err);
      });
  };

  return (
    <>
      {
        isFollowed ?
          <button
            onClick={handleFollow}
            className="btn-light">
            {t("Unfollow")}
          </button>
          :
          <button
            onClick={handleFollow}
            className="btn-dark">
            {t("Follow")}
          </button>
      }
    </>
  );
};

export default FollowButton;
