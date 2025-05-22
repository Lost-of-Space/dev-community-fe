
import { useTranslation } from "react-i18next";

export const useLocalizedDateUtils = () => {
  const { t } = useTranslation();

  const months = [
    t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"),
    t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec")
  ];

  const days = [
    t("sunday"), t("monday"), t("tuesday"),
    t("wednesday"), t("thursday"), t("friday"), t("saturday")
  ];

  const getDay = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getFullDay = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return { getDay, getFullDay, days, months };
};


// If there would be an error, use this code instead, it does not use translation.
/*
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const getDay = (timestamp) => {
  let date = new Date(timestamp);

  return `${date.getDate()} ${months[date.getMonth()]}`
}

export const getFullDay = (timestamp) => {
  let date = new Date(timestamp);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
*/
