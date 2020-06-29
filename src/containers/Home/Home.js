import React, { useState, useReducer, useEffect } from "react";
import Searchbar from "../../components/Searchbar/Searchbar";
import VideoContainer from "../../components/Video/VideoContainer/VideoContainer";

// http
import axios from "axios";
import videosUrl from "../../config/videosAPI/videosAPI";

const filtersReducer = (filters, action) => {
    switch (action.type) {
        case "SET_ORDER":
            return {
                ...filters,
                order: action.order,
            };
        case "SET_DURATION":
            return {
                ...filters,
                duration: action.duration,
            };
        case "SET_QUALITY":
            return {
                ...filters,
                quality: action.quality,
            };
        default:
            return filters;
    }
};

const Home = () => {
    // useState
    const [searchQuery, setSearchQuery] = useState("");

    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);

    const [prevPage, setPrevPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [prevPageToken, setPrevPageToken] = useState(null);
    const [nextPageToken, setNextPageToken] = useState(null);

    useEffect(() => {
        if (currentPage && prevPage) {
            if (currentPage > prevPage) {
                searchVideosHandler(nextPageToken)
            } else if (currentPage < prevPage) {
                searchVideosHandler(prevPageToken);
            }
        }
        // console.log(currentPage, "current");
        // console.log(prevPage, "prev");
        // console.log(prevPageToken, "prevToken");
        // console.log(nextPageToken, "nextToken");
    }, [currentPage, prevPage]);

    // useReducer
    const [filters, dispatch] = useReducer(filtersReducer, {
        order: "relevance",
        duration: "any",
        quality: "any",
    });

    const clearSearchHandler = () => setSearchQuery("");
    const setOrderHandler = (order) => dispatch({ type: "SET_ORDER", order });
    const setDurationHandler = (duration) => dispatch({ type: "SET_DURATION", duration });
    const setQualityHandler = (quality) => dispatch({ type: "SET_QUALITY", quality });

    const startSearchHandler = () => {
        setVideosLoading(true);
        setVideos([]);
    };

    const finishSearchHandler = (videos, prevPageToken, nextPageToken) => {
        setVideos(videos);
        setVideosLoading(false);
        setPrevPageToken(prevPageToken);
        setNextPageToken(nextPageToken);
    };

    const changePageHandler = (pageValue) => {
        setCurrentPage((prevPage) => {
            setPrevPage(prevPage);
            return pageValue;
        });
    };

    const searchVideosHandler = (currentPageToken) => {
        startSearchHandler();

        console.log("Search videos Handler");

        const searchParams = {
            q: searchQuery,
            maxResults: 9,
            videoEmbeddable: true,
            type: "video",
            order: filters.order,
            duration: filters.duration,
            quality: filters.quality,
        };

        if (currentPageToken) {
            searchParams.pageToken = currentPageToken;
        }

        axios.get(videosUrl, { params: searchParams })
            .then((response) => {
                const videosArray = response.data.items;
                const formattedVideos = [];

                // console.log(response.data);

                const prevPageToken = response.data.prevPageToken;
                const nextPageToken = response.data.nextPageToken;

                videosArray.forEach((video) => {
                    formattedVideos.push({
                        id: video.id.videoId,
                        title: video.snippet.title,
                    });
                });

                finishSearchHandler(formattedVideos, prevPageToken, nextPageToken);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <Searchbar
                searchValue={searchQuery}
                searchValueChanged={setSearchQuery}
                searchClicked={searchVideosHandler}
                searchCleared={clearSearchHandler}
                order={filters.order}
                orderChanged={setOrderHandler}
                duration={filters.duration}
                durationChanged={setDurationHandler}
                quality={filters.quality}
                qualityChanged={setQualityHandler}
            />
            <VideoContainer
                videos={videos}
                loading={videosLoading}
                videosType="search"
                pageChanged={changePageHandler}
                page={currentPage}
            />
        </div>
    );
};

export default Home;
