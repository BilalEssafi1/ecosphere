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
import {
  useProfileData,
  useSetProfileData,
} from "../../contexts/ProfileDataContext";
import { Button, Image } from "react-bootstrap";

function ProfilePage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const currentUser = useCurrentUser();
  const { id } = useParams();
  const setProfileData = useSetProfileData();
  const { pageProfile } = useProfileData();
  const profile = pageProfile?.results?.[0];
  const is_owner = currentUser?.username === profile?.owner;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await axiosReq.get(`/profiles/${id}/`);
        setProfileData((prevState) => ({
          ...prevState,
          pageProfile: { results: [profileData] },
        }));
      } catch (err) {
        console.log(err);
      } finally {
        setHasLoaded(true);
      }
    };
    fetchData();
  }, [id, setProfileData]);

  if (!hasLoaded) return <Asset spinner />;
  if (!profile) return <p>Profile not found</p>;

  return (
    <Row>
      <Col className="py-2 p-0 p-lg-2" lg={8}>
        <PopularProfiles mobile />
        <Container className={appStyles.Content}>
          <Row noGutters className="px-3 text-center">
            <Col lg={3} className="text-lg-left">
              <Image
                className={styles.ProfileImage}
                roundedCircle
                src={profile.image}
              />
            </Col>
            <Col lg={6}>
              <h3 className="m-2">{profile.owner}</h3>
              <Row className="justify-content-center no-gutters">
                <Col xs={3} className="my-2">
                  <div>{profile.posts_count}</div>
                  <div>posts</div>
                </Col>
                <Col xs={3} className="my-2">
                  <div>{profile.followers_count}</div>
                  <div>followers</div>
                </Col>
                <Col xs={3} className="my-2">
                  <div>{profile.following_count}</div>
                  <div>following</div>
                </Col>
              </Row>
            </Col>
            <Col lg={3} className="text-lg-right">
              {currentUser && !is_owner && (
                <Button
                  className={`${btnStyles.Button} ${
                    profile.following_id ? btnStyles.BlackOutline : btnStyles.Black
                  }`}
                  onClick={() => {}}
                >
                  {profile.following_id ? "unfollow" : "follow"}
                </Button>
              )}
            </Col>
            {profile.content && <Col className="p-3">{profile.content}</Col>}
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