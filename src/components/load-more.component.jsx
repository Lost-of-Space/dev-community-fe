import { useTranslation } from "react-i18next";

const LoadMoreDataBtn = ({ state, fetchDataFunc, additionalParam, className = "" }) => {
    const { t } = useTranslation();

    if (state != null && state.totalDocs > state.results.length) {
        return (
            <button className={"text-dark-grey p-2 px-3 hover:bg-grey/30 flex items-center gap-2 " + className}
                onClick={() => { fetchDataFunc({ ...additionalParam, page: state.page + 1 }) }}
            >
                {t("Load More")}
            </button>
        )
    }
}

export default LoadMoreDataBtn