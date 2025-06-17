import { Link } from "react-router-dom";
import FollowButton from "./follow-button.component";

const FollowedUserCard = ({ user, targetUsername = null }) => {

  let { personal_info: { fullname, username, profile_img } } = user;

  return (
    <div className="flex justify-between gap-5 items-center mb-5">
      <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5 w-full">
        <img src={profile_img} alt="user avatar" className="w-12 h-12 rounded-full max-sm:hidden" />
        <div>
          <h1 className="font-medium text-xl line-clamp-2">{fullname}</h1>
          <p className="text-dark-grey">@{username}</p>
        </div>
      </Link>
      {
        !targetUsername ?
          ""
          :
          <FollowButton username={targetUsername} />
      }
    </div>
  )

}

export default FollowedUserCard;