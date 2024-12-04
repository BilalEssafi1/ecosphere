import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Asset from "../../components/Asset";
import styles from "../../styles/ProfilePage.module.css";
import appStyles from "../../App.module.css";
import btnStyles from "../../styles/Button.module.css";
import PopularProfiles from "./PopularProfiles";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useParams } from "react-router";
import { axiosReq } from "../../api/axiosDefaults";
import { useProfileData, useSetProfileData } from "../../contexts/ProfileDataContext";
import { Button, Image } from "react-bootstrap";

function ProfilePage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const currentUser = useCurrentUser();
  const { id } = useParams();
  const setGlobalProfileData = useSetProfileData();
  const is_owner = currentUser?.username === profileData?.owner;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosReq.get(`/profiles/${id}/`);
        setProfileData(data);
        setGlobalProfileData(prevState => ({
          ...prevState,
          pageProfile: { results: [data] },
        }));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setHasLoaded(true);
      }
    };

    setHasLoaded(false);
    fetchData();
  }, [id, setGlobalProfileData]);

  if (!hasLoaded) return <Asset spinner />;
  if (!profileData) return <p>Profile not found</p>;

  return (
    <Row>
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />
        <Container className={appStyles.Content}>
          <Row noGutters className="px-3 text-center">
            <Col lg={3} className="text-lg-left">
              <Image className={styles.ProfileImage} roundedCircle src={profileData.image} />
            </Col>
            <Col lg={6}>
              <h3 className="m-2">{profileData.owner}</h3>
              <Row className="justify-content-center no-gutters">
                <Col xs={3} className="my-2">
                  <div>{profileData.posts_count}</div>
                  <div>posts</div>
                </Col>
                <Col xs={3} className="my-2">
                  <div>{profileData.followers_count}</div>
                  <div>followers</div>
                </Col>
                <Col xs={3} className="my-2">
                  <div>{profileData.following_count}</div>
                  <div>following</div>
                </Col>
              </Row>
            </Col>
            <Col lg={3} className="text-lg-right">
              {currentUser && !is_owner && (
                <Button
                  className={`${btnStyles.Button} ${profileData.following_id ? btnStyles.BlackOutline : btnStyles.Black}`}
                  onClick={() => {}}
                >
                  {profileData.following_id ? "unfollow" : "follow"}
                </Button>
              )}
            </Col>
            {profileData.content && <Col className="p-3">{profileData.content}</Col>}
          </Row>
          <hr />
          <p className="text-center">Profile owner's posts</p>
          <hr />
        </Container>
      </Col>
      <Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
        <PopularProfiles />
      </Col>
    </Row>
  );
}

export default ProfilePage;