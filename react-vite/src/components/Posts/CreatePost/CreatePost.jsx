import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkCreatePost } from "../../../redux/post";
import { thunkGetCommunities } from "../../../redux/community";
import "./CreatePost.css";

const CreatePost = (props) => {
  const { community } = Object.fromEntries(
    new URLSearchParams(location.search)
  );
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const communitiesObj = useSelector((state) => state.communities);
  const navigate = useNavigate();
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [communityId, setCommunityId] = useState(community || 1);
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    dispatch(thunkGetCommunities());
  }, [dispatch]);

  if (!user) return <h2>You must be logged in to create a post!</h2>;
  if (!Object.values(communitiesObj).length) return null;

  const communities = Object.values(communitiesObj);

  const communityOptions = communities.map((community) => (
    <option value={community.id} key={community.id}>
      {community.community_name}
    </option>
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = {};

    if (!postTitle.length || postTitle.length > 50)
      validationErrors.postTitle =
        "Post title must be between 1 and 50 characters";
    if (!postBody.length) validationErrors.postBody = "Body is required";

    if (postBody.length > 5000)
      validationErrors.postBody = "Body must be less than 5000 characters";

    if (Object.values(validationErrors).length) {
      setErrors(validationErrors);
    } else {
      const formData = new FormData();

      formData.append("title", postTitle);
      formData.append("body", postBody);
      formData.append("image_url", imageUrl);
      formData.append("community_id", communityId);

      setImageLoading(true);

      await dispatch(thunkCreatePost(formData))
        .then((createdPost) => {
          navigate(`/posts/${createdPost.id}`);
        })
        .catch(async (res) => {
          console.log("Inside create post errors catch =>", res);
        });
    }
  };

  return (
    <div className="post-create-edit">
      <h1>Create a Post!</h1>
      <form
        className="create-post-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="post-input-div">
          <h3>
            <span className="required-form">* </span>What community does this
            belong in?
          </h3>
          <select
            name="community"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="input-create"
          >
            {communityOptions}
          </select>
        </div>
        <div className="post-input-div">
          <h3>
            <span className="required-form">* </span>What&apos;s the title of
            your post?
          </h3>
          <label htmlFor="title">
            <input
              type="text"
              name="title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Title"
              className="input-create desc"
            />
          </label>
        </div>
        <div className="post-errors">
          {errors.postTitle && <p>{errors.postTitle}</p>}
        </div>
        <div className="post-input-div">
          <h3>
            <span className="required-form">* </span>Post Body
          </h3>
          <label htmlFor="body">
            <textarea
              name="body"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Body"
              className="input-create desc"
            />
          </label>
        </div>
        <div className="post-errors">
          {errors.postBody && <p>{errors.postBody}</p>}
        </div>
        <div className="post-input-div">
          <h3>Image File</h3>
          <label htmlFor="imageUrl">
            <input
              name="imageUrl"
              type="file"
              accept="image/*"
              onChange={(e) => setImageUrl(e.target.files[0])}
              className="input-create"
            />
          </label>
        </div>

        {!imageLoading && (
          <button type="submit" className="create-post button">
            Create Post
          </button>
        )}
        {imageLoading && <p className="loading">Loading...</p>}
      </form>
    </div>
  );
};

export default CreatePost;
