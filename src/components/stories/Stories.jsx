import { useContext, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Stories = () => {
  const [file, setFile] = useState(null); // State for the selected story image file
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
    queryKey: ["stories"],
    queryFn: () =>
      makeRequest.get("/stories").then((res) => {
        return res.data;
      }),
  });

  const queryClient = useQueryClient();

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      console.error(
        "Error uploading story image:",
        err.response?.data || err.message
      );
      throw err;
    }
  };

  const addStoryMutation = useMutation({
    mutationFn: (newStory) => {
      return makeRequest.post("/stories", newStory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setFile(null);
    },
    onError: (err) => {
      console.error("Error creating story:", err.response?.data || err.message);
    },
  });

  return (
    <div className="stories">
      {/* This is the "Add Story" box */}
      <div className="story add-story-box">
        {/* We are removing the img tag from here completely */}
        {/* {file ? (
          <img src={URL.createObjectURL(file)} alt="Selected Story Preview" />
        ) : (
          <img
            src={
              currentUser.user?.profilePic
                ? currentUser.user.profilePic
                : "https://images.pexels.com/photos/3228727/pexels-photo-3228727.jpeg?auto=compress&cs=tinysrgb&w=1600"
            }
            alt="Current User Profile"
          />
        )} */}
        
        {/* Username */}
        <span>{currentUser.user?.name}</span>

        {/* Hidden file input */}
        <input
          type="file"
          id="storyFile"
          style={{ display: "none" }} // Keep hidden
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
        
        {/* The label itself will be styled as the button */}
        <label htmlFor="storyFile" className="add-story-label-button">
          + {/* The plus sign directly inside the label */}
        </label>

        {/* If you want a separate "Post Story" button after selection */}
        {/* {file && (
          <button className="post-story-button" onClick={() => addStoryMutation.mutate({ img: URL.createObjectURL(file) })}>
            Post Story
          </button>
        )} */}
      </div>

      {error
        ? `Something went wrong! Error: ${
            error.response?.data || error.message
          }`
        : isLoading
        ? "loading"
        : data && data.length > 0
        ? data.map((story) => (
            <div className="story" key={story.id}>
              <img
                src={story.img ? story.img : "default-story.jpg"}
                alt=""
              />
              <span>{story.name}</span>
            </div>
          ))
        : "No stories found."}
    </div>
  );
};

export default Stories;